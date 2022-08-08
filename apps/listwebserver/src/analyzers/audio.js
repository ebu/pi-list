const _ = require('lodash');
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const {
    appendError
} = require('./utils');

import {
    updateStreamWithPktTsVsRtpTs
} from './audio2';

// returns
// {
//     result : as defined in constants.outcome
//     level : as defined in constants.qualitative
// }
function getTsdfCompliance(tsdf) {
    if (_.isNil(tsdf) || _.isNil(tsdf.max))
        return {
            result: constants.outcome.undefined,
            level: constants.qualitative.not_compliant,
        };

    if (tsdf.max < tsdf.tolerance)
        return {
            result: constants.outcome.compliant,
            level: constants.qualitative.narrow,
        };

    if (tsdf.max > tsdf.limit)
        return {
            result: constants.qualitative.not_compliant,
            level: constants.qualitative.not_compliant,
        };

    return {
        result: constants.outcome.compliant,
        level: constants.qualitative.wide,
    };
}

function getTsdfMax(range) {
    if (_.isNil(range) || _.isNil(range[0])) return null;
    return range[0].max;
}

function updateStreamWithTsdfMax(stream, tsdfMax, tsdfProfile) {
    if (!stream.media_specific) return null; // can't do anything without associated stream

    var tsdf = {
        max: tsdfMax,
        tolerance: stream.media_specific.packet_time * 1000 * tsdfProfile.tolerance,
        limit: stream.media_specific.packet_time * 1000 * tsdfProfile.limit,
        unit: 'μs',
    };
    const {
        result,
        level
    } = getTsdfCompliance(tsdf);
    tsdf['compliance'] = level;
    tsdf['level'] = level;
    tsdf['result'] = result;

    //TODO clean this: choose between 'analyses' and 'global_audio_analysis'
    let global_audio_analysis = stream.global_audio_analysis === undefined ? {} : stream.global_audio_analysis;
    global_audio_analysis['tsdf'] = tsdf;
    stream = _.set(stream, 'global_audio_analysis', global_audio_analysis);

    const report = {
        result,
        details: tsdf,
    };
    stream = _.set(stream, 'analyses.tsdf', report);

    if (result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.tsdf_not_compliant,
        });
    }

    return stream;
}

function calculateTsdfFromRange(stream, range, tsdfProfile) {
    const tsdfMax = getTsdfMax(range);
    return updateStreamWithTsdfMax(stream, tsdfMax, tsdfProfile);
}

// Returns one promise, which resolves to the stream.
function doCalculateTsdf(pcapId, stream, tsdfProfile) {
    return influxDbManager.getAudioTimeStampedDelayFactorRange(pcapId, stream.id).then((range) => {
        delete range.data.time;
        calculateTsdfFromRange(stream, range.data, tsdfProfile);
    });
}

function doCalculatePktTsVsRtpTsRange(pcapId, stream, rtpProfile) {
    return influxDbManager
        .getAudioPktTsVsRtpTsRange(pcapId, stream.id)
        .then((range) => updateStreamWithPktTsVsRtpTs(stream, range.data[0], rtpProfile));
}

// Returns one promise, which result is undefined.
function doAudioStreamAnalysis(pcapId, stream, audioAnalysisProfile) {
    return doCalculateTsdf(pcapId, stream, audioAnalysisProfile.tsdf)
        .then(() => doCalculatePktTsVsRtpTsRange(pcapId, stream, audioAnalysisProfile.deltaPktTsVsRtpTsLimit))
        .then((info) => Stream.findOneAndUpdate({
            id: stream.id
        }, info, {
            new: true
        }));
}

// Returns one array with a promise for each stream. The result of the promise is undefined.
function doAudioAnalysis(pcapId, streams, audioAnalysisProfile) {
    const promises = streams.map((stream) => doAudioStreamAnalysis(pcapId, stream, audioAnalysisProfile));
    return Promise.all(promises);
}

module.exports = {
    updateStreamWithTsdfMax,
    doAudioAnalysis,
};