const _ = require('lodash');
const fs = require('../util/filesystem');
const constants = require('../enums/analysis');
const Stream = require('../models/stream');
const { appendError } = require('./utils');
const {
    doRtpTsAnalysis,
    validateRtpTs,
    doInterFrameRtpTsDeltaAnalysis,
    validateInterFrameRtpTsDelta,
    addRtpSequenceAnalysisToStream,
} = require('./rtp');
const { getUserId } = require('../auth/middleware');

import { getUserFolder } from '../util/analysis/utils';

const validation = {
    rtp: {
        pktsPerFrame: {
            min: 1, // anc must have at least one (keep alive) or more pkt/frame-or-field
        },
        deltaPktTsVsRtpTsLimit: {
            min: 0,
            max: 1000000, // in ns
        },
    },
};

const getAverageFromHistogram = (hist) => {
    if (!hist || hist.length === 0) return 0;

    const avg = hist.reduce((prev, curr) => {
        return prev + (curr[0] * curr[1]) / 100;
    }, 0);

    return avg;
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
    if (stream.statistics.wrong_marker_count > 0) {
        stream = _.set(stream, 'analyses.marker_bit.result', constants.outcome.not_compliant);
        stream = _.set(stream, 'analyses.marker_bit.detail.count', stream.statistics.wrong_marker_count);
        stream = appendError(stream, { id: constants.errors.invalid_marker_bit });
    } else {
        stream = _.set(stream, 'analyses.marker_bit.result', constants.outcome.compliant);
    }
};

const ancillaryCheckFieldBits = async (stream) => {
    if (stream.statistics.wrong_field_count > 0) {
        stream = _.set(stream, 'analyses.field_bits.result', constants.outcome.not_compliant);
        stream = _.set(stream, 'analyses.field_bits.detail.count', stream.statistics.wrong_field_count);
        stream = appendError(stream, { id: constants.errors.invalid_field_bits });
    } else {
        stream = _.set(stream, 'analyses.field_bits.result', constants.outcome.compliant);
    }
};

const ancillaryCheckPayloads = async (stream) => {
    if (stream.statistics.payload_error_count > 0) {
        stream = _.set(stream, 'analyses.anc_payloads.result', constants.outcome.not_compliant);
        stream = _.set(stream, 'analyses.anc_payloads.detail.count', stream.statistics.payload_error_count);
        stream = appendError(stream, { id: constants.errors.ancillary_invalid_payload });
    } else {
        stream = _.set(stream, 'analyses.anc_payloads.result', constants.outcome.compliant);
    }
};

const ancillaryPktPerFrame = async (req, stream) => {
    // Read from range histogram file and report everthing in stream data
    const histogramFile = `${getUserFolder(req)}/${req.pcap.uuid}/${stream.id}/pkt_hist.json`;
    const histogram = (await fs.readFile(histogramFile))['histogram'];

    const limit = validation.rtp.pktsPerFrame;
    const range = {
        min: getLowestFromHistogram(histogram),
        max: getHighestFromHistogram(histogram),
        avg: getAverageFromHistogram(histogram),
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
};

const doAncillaryStreamAnalysis = async (req, stream) => {
    const pcapId = req.pcap.uuid;
    await ancillaryCheckMarkerBit(stream);
    await ancillaryCheckFieldBits(stream);
    await ancillaryCheckPayloads(stream);
    await ancillaryPktPerFrame(req, stream);
    await doRtpTsAnalysis(pcapId, stream);
    await validateRtpTs(stream, validation);
    await doInterFrameRtpTsDeltaAnalysis(pcapId, stream);
    await validateInterFrameRtpTsDelta(stream);
    return await Stream.findOneAndUpdate({ id: stream.id }, stream, {
        new: true,
    });
};

const doAncillaryAnalysis = (req, streams) => {
    const promises = streams.map((stream) => doAncillaryStreamAnalysis(req, stream));
    return Promise.all(promises);
};

module.exports = {
    doAncillaryAnalysis,
};
