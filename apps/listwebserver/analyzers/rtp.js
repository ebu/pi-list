const _ = require('lodash');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const { appendError } = require('./utils');

function getResult(dropped_packets) {
    if (dropped_packets === undefined) return constants.outcome.undefined;
    if (dropped_packets === 0) return constants.outcome.compliant;
    return constants.outcome.not_compliant;
}

function addRtpSequenceAnalysisToStream(stream) {
    const dropped_packets = _.get(stream, 'statistics.dropped_packet_count', undefined);
    const packet_count = _.get(stream, 'statistics.packet_count', undefined);
    
    const report = {
        result: getResult(dropped_packets),
        details: {
            dropped_packets,
            packet_count
        }
    };

    if (report.result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.dropped_packets
        });
    }

    return _.set(stream, 'analyses.rtp_sequence', report);
}

// Returns one promise, which result is undefined.
function doRtpStreamAnalysis(pcapId, stream) {
    stream = addRtpSequenceAnalysisToStream(stream);

    return Stream.findOneAndUpdate({ id: stream.id }, stream, { new: true });
}

// Returns one array with a promise for each stream. The result of the promise is undefined.
function doRtpAnalysis(pcapId, streams) {
    const promises = streams.map(stream => doRtpStreamAnalysis(pcapId, stream));
    return Promise.all(promises);
}

module.exports = {
    addRtpSequenceAnalysisToStream,
    doRtpAnalysis
};
