const _ = require('lodash');
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const { appendError } = require('./utils');
import logger from '../util/logger';

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
    const { result, level } = getTsdfCompliance(tsdf);
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

function getPktTsVsRtpTsCompliance(range, limit) {
    if (
        _.isNil(range) ||
        _.isNil(range.min) ||
        _.isNil(range.max) ||
        range.min < limit.min ||
        range.max > limit.max ||
        range.avg > limit.maxAvg
    ) {
        return {
            result: constants.outcome.not_compliant,
        };
    }

    return {
        result: constants.outcome.compliant,
    };
}

function updateStreamWithPktTsVsRtpTs(stream, range, profile) {
    let global_audio_analysis = stream.global_audio_analysis === undefined ? {} : stream.global_audio_analysis;

    // convert to 'μs'
    const packet_time_us = stream.media_specific.packet_time * 1000;
    const limit =
        profile.unit === 'packet_time'
            ? {
                  min: profile.min * packet_time_us,
                  maxAvg: profile.maxAvg * packet_time_us,
                  max: profile.max * packet_time_us,
              }
            : {
                  min: profile.min,
                  maxAvg: profile.maxAvg,
                  max: profile.max,
              };

    const packet_ts_vs_rtp_ts = {
        range: range,
        limit: limit,
        unit: 'μs',
    };
    global_audio_analysis['packet_ts_vs_rtp_ts'] = packet_ts_vs_rtp_ts;

    // TODO: maybe remove global_audio_analysis
    stream = _.set(stream, 'global_audio_analysis', global_audio_analysis);

    const { result } = getPktTsVsRtpTsCompliance(range, limit);
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

function calculateTsdfFromRange(stream, range, tsdfProfile) {
    const tsdfMax = getTsdfMax(range);
    return updateStreamWithTsdfMax(stream, tsdfMax, tsdfProfile);
}

// Returns one promise, which resolves to the stream.
function doCalculateTsdf(pcapId, stream, tsdfProfile) {
    return influxDbManager.getAudioTimeStampedDelayFactorRange(pcapId, stream.id).then((range) => {
        delete range.time;
        calculateTsdfFromRange(stream, range, tsdfProfile);
    });
}

function doCalculatePktTsVsRtpTsRange(pcapId, stream, rtpProfile) {
    return influxDbManager
        .getAudioPktTsVsRtpTsRange(pcapId, stream.id)
        .then((range) => updateStreamWithPktTsVsRtpTs(stream, range[0], rtpProfile));
}

// Returns one promise, which result is undefined.
function doAudioStreamAnalysis(pcapId, stream, audioAnalysisProfile) {
    return doCalculateTsdf(pcapId, stream, audioAnalysisProfile.tsdf)
        .then(() => doCalculatePktTsVsRtpTsRange(pcapId, stream, audioAnalysisProfile.deltaPktTsVsRtpTsLimit))
        .then((info) => Stream.findOneAndUpdate({ id: stream.id }, info, { new: true }));
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
