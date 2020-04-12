const _ = require('lodash');
const fs = require('../util/filesystem');
const constants = require('../enums/analysis');
const Stream = require('../models/stream');
const { appendError, validateMulticastAddresses } = require('./utils');
const influxDbManager = require('../managers/influx-db');

// For some reason, getUserFolder can't be imported...
//const { getUserFolder, } = require('../util/analysis');
function getUserFolder(req) {
    const program = require('../util/programArguments');
    return `${program.folder}/${req.session.passport.user.id}`;
}

const validation = {
    rtp: {
        pktPerFrame: {
            min: 1, // anc must have at least one (keep alive) or more pkt/frame-or-field
        },
        deltaPktTsVsRtpTsLimit: {
            min: 0,
            max: 1000000, // in ns
        },
    },
};

const getLowestFromHistogram = (hist) => {
    if (!hist || hist.length === 0) return 0;
    return hist[0][0];
};

const getHighestFromHistogram = (hist) => {
    if (!hist || hist.length === 0) return 0;
    return hist[hist.length - 1][0];
};

const ancillaryCheckMarkerBit = async (stream) => {
    if (stream.statistics.wrong_marker_count > 0)
    {
        stream = _.set(stream, 'analyses.marker_bit.result', constants.outcome.not_compliant);
        stream = _.set(stream, 'analyses.marker_bit.detail.count', stream.statistics.wrong_marker_count);
        stream = appendError(stream, { id: constants.errors.invalid_marker_bit });
    } else {
        stream = _.set(stream, 'analyses.marker_bit.result', constants.outcome.compliant);
    }
}

const ancillaryCheckFieldBits = async (stream) => {
    if (stream.statistics.wrong_field_count > 0)
    {
        stream = _.set(stream, 'analyses.field_bits.result', constants.outcome.not_compliant);
        stream = _.set(stream, 'analyses.field_bits.detail.count', stream.statistics.wrong_field_count);
        stream = appendError(stream, { id: constants.errors.invalid_field_bits });
    } else {
        stream = _.set(stream, 'analyses.field_bits.result', constants.outcome.compliant);
    }
}

const ancillaryCheckPayloads = async (stream) => {
    if (stream.statistics.payload_error_count > 0)
    {
        stream = _.set(stream, 'analyses.anc_payloads.result', constants.outcome.not_compliant);
        stream = _.set(stream, 'analyses.anc_payloads.detail.count', stream.statistics.payload_error_count);
        stream = appendError(stream, { id: constants.errors.ancillary_invalid_payload });
    } else {
        stream = _.set(stream, 'analyses.anc_payloads.result', constants.outcome.compliant);
    }
}

const ancillaryPktPerFrame = async (req, stream) => {
    // Read from range histogram file and report everthing in stream data
    const histogramFile = `${getUserFolder(req)}/${req.pcap.uuid}/${stream.id}/anc_pkt.json`;
    const histogram = (await fs.readFile(histogramFile))['histogram'];

    const limit = validation.rtp.pktPerFrame;
    const range = {
        min: getLowestFromHistogram(histogram),
        max: getHighestFromHistogram(histogram),
    };
    if (range.min < limit.min) {
        stream = _.set(stream, 'analyses.pkts_per_frame.result', constants.outcome.not_compliant);
        stream = appendError(stream, { id: constants.errors.invalid_rtp_pkts_per_frame });
    } else {
        stream = _.set(stream, 'analyses.pkts_per_frame.result', constants.outcome.compliant);
    }
    _.set(stream, 'analyses.pkts_per_frame.details.histogram', histogram);
    _.set(stream, 'analyses.pkts_per_frame.details.range', range);
    _.set(stream, 'analyses.pkts_per_frame.details.limit', limit);
    _.set(stream, 'analyses.pkts_per_frame.details.unit', 'packets');

    return stream;
}

// Sets analyses.packet_ts_vs_rtp_ts.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function validateRtpTimes(stream) {
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

    const { min, max } = delta;
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

// Returns one promise that resolves to an object with the updated analysis.
const doRtpTimeAnalysis = async (req, stream) => {
    const pcapId = req.pcap.uuid;
    const value = await influxDbManager.getAncillaryPktTsVsRtpTsMinMax(pcapId, stream.id);

    if (_.isNil(value) || value.length < 1 || _.isNil(value[0])) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no DeltaPacketTimeVsRtpTimeMinMax for stream `stream.id` in `pcapId`',
        });
        return stream;
    }

    const { min, max, avg } = value[0];
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.range', {
        min,
        max,
        avg,
    });

    return stream;
};
const doAncillaryStreamAnalysis = async (req, stream) => {
    await ancillaryCheckMarkerBit(stream);
    await ancillaryCheckFieldBits(stream);
    await ancillaryCheckPayloads(stream);
    await ancillaryPktPerFrame(req, stream);
    await doRtpTimeAnalysis(req, stream);
    await validateRtpTimes(stream);
    await validateMulticastAddresses(stream);
    return await Stream.findOneAndUpdate({ id: stream.id }, stream, {
        new: true,
    });
}

const doAncillaryAnalysis = (req, streams) => {
    const promises = streams.map(stream => doAncillaryStreamAnalysis(req, stream));
    return Promise.all(promises);
}

module.exports = {
    doAncillaryAnalysis
};

