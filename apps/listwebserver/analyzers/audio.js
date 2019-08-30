const _ = require('lodash');
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const { appendError, validateMulticastAddresses } = require('./utils');
const logger = require('../util/logger');

const log = logger('audio');

// determines compliance based on EBU's recommendation
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

function updateStreamWithTsdfMax(stream, tsdf_max) {
    if (!stream.media_specific) return null; // can't do anything without associated stream

    var tsdf = {
        max: tsdf_max,
        tolerance: stream.media_specific.packet_time * 1000, // usec
        limit: stream.media_specific.packet_time * 1000 * 17, // usec
    };
    const { result, level } = getTsdfCompliance(tsdf);
    tsdf['compliance'] = level;
    tsdf['level'] = level;
    tsdf['result'] = result;

    global_audio_analysis =
        stream.global_audio_analysis === undefined
            ? {}
            : stream.global_audio_analysis;
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

function getRtpTsVsPktTsCompliance(range, limit) {
    if (
        _.isNil(range) ||
        _.isNil(range.min) ||
        _.isNil(range.max) ||
        range.min < limit.min ||
        range.max > limit.max
    ) {
        return {
            result: constants.outcome.not_compliant,
        };
    }

    return {
        result: constants.outcome.compliant,
    };
}

function updateStreamWithRtpTsVsPktTs(stream, range) {
    const limit = { min: 0, max: 2000 }; //un-hardcode this in us

    global_audio_analysis =
        stream.global_audio_analysis === undefined
            ? {}
            : stream.global_audio_analysis;
    const packet_ts_vs_rtp_ts = {
        range: range,
        limit: limit,
    };
    global_audio_analysis['packet_ts_vs_rtp_ts'] = packet_ts_vs_rtp_ts;
    stream = _.set(stream, 'global_audio_analysis', global_audio_analysis);

    const { result } = getRtpTsVsPktTsCompliance(range, limit);
    const report = {
        result,
        details: packet_ts_vs_rtp_ts,
    };
    stream = _.set(stream, 'analyses.packet_ts_vs_rtp_ts', report);

    if (result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.audio_rtp_ts_not_compliant,
        });
    }

    return stream;
}

function calculateTsdfFromRange(stream, range) {
    const tsdf_max = getTsdfMax(range);
    return updateStreamWithTsdfMax(stream, tsdf_max);
}

// Returns one promise, which resolves to the stream.
function doCalculateTsdf(pcapId, stream) {
    return influxDbManager
        .getAudioTimeStampedDelayFactorRange(pcapId, stream.id)
        .then(range => {
            delete range.time;
            calculateTsdfFromRange(stream, range);
        });
}

function doCalculateRtpTsVsPktTsRange(pcapId, stream) {
    return influxDbManager
        .getAudioRtpTsVsPktTsRange(pcapId, stream.id)
        .then(range => updateStreamWithRtpTsVsPktTs(stream, range[0]));
}

// Returns one promise, which result is undefined.
function doAudioStreamAnalysis(pcapId, stream) {
    return doCalculateTsdf(pcapId, stream)
        .then(info =>
            Stream.findOneAndUpdate({ id: stream.id }, info, { new: true })
        )
        .then(() => doCalculateRtpTsVsPktTsRange(pcapId, stream))
        .then(info =>
              Stream.findOneAndUpdate({ id: stream.id }, info, { new: true })
        )
        .then(validateMulticastAddresses(stream))
        .then(info =>
            Stream.findOneAndUpdate({ id: stream.id }, info, { new: true })
        );
}

// Returns one array with a promise for each stream. The result of the promise is undefined.
function doAudioAnalysis(pcapId, streams) {
    const promises = streams.map(stream =>
        doAudioStreamAnalysis(pcapId, stream)
    );
    return Promise.all(promises);
}

module.exports = {
    updateStreamWithTsdfMax,
    doAudioAnalysis,
};
