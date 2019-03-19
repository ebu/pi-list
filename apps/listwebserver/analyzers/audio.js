const _ = require('lodash');
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const { appendError } = require('./utils');

// determines compliance based on EBU's recommendation
// returns
// {
//     result : as defined in constants.outcome
//     level : as defined in constants.qualitative
// }
function getTsdfCompliance(tsdfMax, packet_time) {
    if (tsdfMax === null || tsdfMax === undefined) return {
        result: constants.outcome.undefined,
        level: constants.qualitative.not_compliant
    };

    if (tsdfMax < packet_time) return {
        result: constants.outcome.compliant,
        level: constants.qualitative.narrow
    };

    if (tsdfMax > 17 * packet_time) return {
        result: constants.qualitative.not_compliant,
        level: constants.qualitative.not_compliant
    };

    return {
        result: constants.outcome.compliant,
        level: constants.qualitative.wide
    };
}

function getTsdfMax(value) {
    if (value === null || value === undefined) return null;
    return value[0].max;
}

function updateStreamWithTsdfMax(stream, tsdfMax) {
    if (!stream.media_specific) return null; // can't do anything without associated stream
    const packet_time = stream.media_specific.packet_time * 1000; // usec

    const { result, level } = getTsdfCompliance(tsdfMax, packet_time);

    stream.global_audio_analysis = { tsdf_max: tsdfMax, tsdf_compliance: level };

    const report = {
        result,
        details: {
            tsdf_max: tsdfMax,
            level
        }
    };

    stream = _.set(stream, 'analyses.tsdf', report);

    if (result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.tsdf_not_compliant
        });
    }

    return stream;
}

function calculateTsdfFromValues(stream, value) {
    const tsdfMax = getTsdfMax(value);
    return updateStreamWithTsdfMax(stream, tsdfMax);
}

// Returns one promise, which resolves to the stream.
function doCalculateTsdf(pcapId, stream) {
    return influxDbManager.getAudioTimeStampedDelayFactorAmp(pcapId, stream.id)
        .then(value => calculateTsdfFromValues(stream, value));
}

// Returns one promise, which result is undefined.
function doAudioStreamAnalysis(pcapId, stream) {
    return doCalculateTsdf(pcapId, stream)
        .then(info => Stream.findOneAndUpdate({ id: stream.id }, info, { new: true }));
}

// Returns one array with a promise for each stream. The result of the promise is undefined.
function doAudioAnalysis(pcapId, streams) {
    const promises = streams.map(stream => doAudioStreamAnalysis(pcapId, stream));
    return Promise.all(promises);
}

module.exports = {
    updateStreamWithTsdfMax,
    doAudioAnalysis
};
