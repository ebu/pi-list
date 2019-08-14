const _ = require('lodash');
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const { appendError, validateMulticastAddresses } = require('./utils');

// Definitions
const validation = {
    rtp: {
        delta_rtp_ts_vs_nt_ticks_min: -2,
        delta_rtp_ts_vs_nt_ticks_max: 45000,
        delta_packet_ts_vs_rtp_ts_ns_min: 0,
        delta_packet_ts_vs_rtp_ts_ns_max: 2000000,
    },
};

// Sets analyses.2110_21_cinst.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function map2110d21Cinst(stream) {
    const compliance = _.get(stream, 'global_video_analysis.cinst.compliance');

    if (compliance === constants.outcome.not_compliant) {
        stream = _.set(
            stream,
            'analyses.2110_21_cinst.result',
            constants.outcome.not_compliant
        );
        stream = appendError(stream, {
            id: constants.errors.cinst_above_maximum,
        });
    } else {
        stream = _.set(
            stream,
            'analyses.2110_21_cinst.result',
            constants.outcome.compliant
        );
    }

    return stream;
}

// Sets analyses.2110_21_vrx.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function map2110d21Vrx(stream) {
    const compliance = _.get(stream, 'global_video_analysis.vrx.compliance');

    if (compliance === constants.outcome.not_compliant) {
        stream = _.set(
            stream,
            'analyses.2110_21_vrx.result',
            constants.outcome.not_compliant
        );
        stream = appendError(stream, {
            id: constants.errors.vrx_above_maximum,
        });
    } else {
        stream = _.set(
            stream,
            'analyses.2110_21_vrx.result',
            constants.outcome.compliant
        );
    }

    return stream;
}

// Sets analyses.packet_ts_vs_rtp_ts.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function validateRtpTimes(stream) {
    const delta = _.get(
        stream,
        'analyses.packet_ts_vs_rtp_ts.details.delta_packet_time_vs_rtp_time_ns',
        null
    );

    if (delta === null) {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value:
                'no value for "analyses.packet_ts_vs_rtp_ts.details.delta_packet_time_vs_rtp_time_ns"',
        });

        return;
    }

    const { min, max } = delta;

    if (
        min < validation.rtp.delta_packet_ts_vs_rtp_ts_ns_min ||
        max > validation.rtp.delta_packet_ts_vs_rtp_ts_ns_max
    ) {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.invalid_delta_packet_ts_vs_rtp_ts,
        });
    } else {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.compliant);
    }

    return stream;
}

// Sets analyses.rtp_ticks.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function validateRtpTicks(stream) {
    const delta = _.get(
        stream,
        'analyses.rtp_ticks.details.delta_rtp_ts_vs_nt_ticks',
        null
    );
    if (delta === null) {
        _.set(stream, 'analyses.rtp_ticks.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value:
                'no value for "analyses.rtp_ticks.details.delta_rtp_ts_vs_nt_ticks"',
        });

        return stream;
    }

    const { min, max } = delta;

    if (
        min < validation.rtp.delta_rtp_ts_vs_nt_ticks_min ||
        max > validation.rtp.delta_rtp_ts_vs_nt_ticks_max
    ) {
        _.set(stream, 'analyses.rtp_ticks.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.invalid_delta_rtp_ts_vs_nt,
        });
    } else {
        _.set(stream, 'analyses.rtp_ticks.result', constants.outcome.compliant);
    }

    return stream;
}

// Returns one promise that resolves to an object with the updated analysis.
const doRtpTicksAnalysis = async (pcapId, stream) => {
    const value = await influxDbManager.getDeltaRtpVsNtTicksMinMax(
        pcapId,
        stream.id
    );

    if (_.isNil(value) || value.length < 1 || _.isNil(value[0])) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value:
                'no DeltaRtpVsNtTicksMinMax for stream `stream.id` in `pcapId`',
        });
        return stream;
    }

    const { min, max, avg } = value[0];
    _.set(stream, 'analyses.rtp_ticks.details.delta_rtp_ts_vs_nt_ticks', {
        min,
        max,
        avg,
    });

    return stream;
};

// Returns one promise that resolves to an object with the updated analysis.
const doRtpTimeAnalysis = async (pcapId, stream) => {
    const value = await influxDbManager.getDeltaPacketTimeVsRtpTimeMinMax(
        pcapId,
        stream.id
    );

    if (_.isNil(value) || value.length < 1 || _.isNil(value[0])) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value:
                'no DeltaPacketTimeVsRtpTimeMinMax for stream `stream.id` in `pcapId`',
        });
        return stream;
    }

    const { min, max, avg } = value[0];
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.delta_packet_time_vs_rtp_time_ns', {
        min,
        max,
        avg,
    });

    return stream;
};

// Returns one promise, which result is undefined.
const doVideoStreamAnalysis = async (pcapId, stream) => {
    await doRtpTicksAnalysis(pcapId, stream);
    await doRtpTimeAnalysis(pcapId, stream);
    await validateRtpTimes(stream);
    await validateRtpTicks(stream);
    await map2110d21Cinst(stream);
    await map2110d21Vrx(stream);
    await validateMulticastAddresses(stream);
    return await Stream.findOneAndUpdate({ id: stream.id }, stream, {
        new: true,
    });
};

// Returns one array with a promise for each stream. The result of the promise is undefined.
function doVideoAnalysis(pcapId, streams) {
    const promises = streams.map(stream =>
        doVideoStreamAnalysis(pcapId, stream)
    );
    return Promise.all(promises);
}

module.exports = {
    doVideoAnalysis,
};
