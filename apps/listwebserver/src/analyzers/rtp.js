const _ = require('lodash');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const {
    appendError
} = require('./utils');
const influxDbManager = require('../managers/influx-db');

function getResult(dropped_packets) {
    if (dropped_packets === undefined) return constants.outcome.undefined;
    if (dropped_packets === 0) return constants.outcome.compliant;
    return constants.outcome.not_compliant;
}

function addRtpSequenceAnalysisToStream(stream) {
    const dropped_packets_count = _.get(stream, 'statistics.dropped_packet_count', undefined);
    const dropped_packets_samples = _.get(stream, 'statistics.dropped_packet_samples', undefined);
    const packet_count = _.get(stream, 'statistics.packet_count', undefined);

    const report = {
        result: getResult(dropped_packets_count),
        details: {
            dropped_packets_count,
            dropped_packets_samples,
            packet_count,
        },
    };

    if (report.result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.dropped_packets,
        });
    }

    return _.set(stream, 'analyses.rtp_sequence', report);
}

function getInterFrameRtpTsDeltaLimit(stream) {
    var rate;

    if (_.get(stream, 'statistics.rate', null) !== null) {
        rate = _.get(stream, 'statistics.rate', null);
    } else if (_.get(stream, 'media_specific.rate', null) !== null) {
        rate = _.get(stream, 'media_specific.rate', null);
    } else {
        return null;
    }

    const rtpClockRate = 90000;
    const interTicks = rtpClockRate / eval(rate);

    return {
        min: Math.floor(interTicks),
        max: Math.ceil(interTicks),
    };
}

function validateInterFrameRtpTsDelta(stream) {
    const delta = _.get(stream, 'analyses.inter_frame_rtp_ts_delta.details.range', null);

    if (delta === null) {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no value for "analyses.inter_frame_rtp_ts_delta.details.range"',
        });

        return;
    }

    const limit = getInterFrameRtpTsDeltaLimit(stream);
    if (limit === null) {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'could not calculate the limits',
        });

        return;
    }

    _.set(stream, 'analyses.inter_frame_rtp_ts_delta.details.limit', limit);
    _.set(stream, 'analyses.inter_frame_rtp_ts_delta.details.unit', 'ticks');

    const {
        min,
        max
    } = delta;
    if (min < limit.min || max > limit.max) {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.invalid_inter_frame_rtp_ts_delta,
        });
    } else {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.compliant);
    }

    return stream;
}

const doInterFrameRtpTsDeltaAnalysis = async (pcapId, stream) => {
    const value = await influxDbManager.getDeltaToPreviousRtpTsMinMax(pcapId, stream.id);

    if (_.isNil(value.data) || value.data.length < 1 || _.isNil(value.data[0])) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no DeltaToPreviousRtpTsMinMax for stream `stream.id` in `pcapId`',
        });
        return stream;
    }

    const {
        min,
        max,
        avg
    } = value.data[0];
    _.set(stream, 'analyses.inter_frame_rtp_ts_delta.details.range', {
        min,
        max,
        avg,
    });

    return stream;
};

const doRtpTsAnalysis = async (pcapId, stream) => {
    //const value = await influxDbManager.getAncillaryPktTsVsRtpTsMinMax(pcapId, stream.id);
    const value = await influxDbManager.getDeltaPacketTimeVsRtpTimeMinMax(pcapId, stream.id);

    if (_.isNil(value.data) || value.data.length < 1 || _.isNil(value.data[0])) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no DeltaPacketTimeVsRtpTimeMinMax for stream `stream.id` in `pcapId`',
        });
        return stream;
    }

    const {
        min,
        max,
        avg
    } = value.data[0];
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.range', {
        min,
        max,
        avg,
    });

    return stream;
};

function validateRtpTs(stream, validation) {
    const delta = _.get(stream, 'analyses.packet_ts_vs_rtp_ts.details.range', null);

    if (delta === null) {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no value for "analyses.packet_ts_vs_rtp_ts.details.range"',
        });

        return;
    }
    const limit = validation.rtp.deltaPktTsVsRtpTsLimit;
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.limit', limit);
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.unit', 'ns');

    const {
        min,
        max
    } = delta;
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
    if (min < limit.min || max > limit.max) {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.invalid_delta_packet_ts_vs_rtp_ts,
        });
    } else {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.compliant);
    }

    return stream;
}


// Returns one promise, which result is undefined.
async function doRtpStreamAnalysis(stream) {
    const s = addRtpSequenceAnalysisToStream(stream);

    await Stream.findOneAndUpdate({
        id: stream.id
    }, s, {
        new: true
    });
}

module.exports = {
    doInterFrameRtpTsDeltaAnalysis,
    validateInterFrameRtpTsDelta,
    doRtpTsAnalysis,
    validateRtpTs,
    addRtpSequenceAnalysisToStream,
    doRtpStreamAnalysis,
};