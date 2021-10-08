const constants = require('../../enums/analysis');

function addStreamErrorsToSummary(stream, error_list) {
    stream.error_list.forEach((error) =>
        error_list.push({
            stream_id: stream.id,
            value: error,
        })
    );
}

function addWarningsToSummary(pcap, warning_list) {
    if (pcap.truncated) {
        warning_list.push({
            stream_id: null,
            value: { id: constants.warnings.pcap.truncated },
        });
    }
}

// Returns the number of not-compliant streams
function calculateNotCompliant(streams) {
    return streams.reduce((acc, stream) => (stream.error_list.length === 0 ? acc : acc + 1), 0);
}

module.exports = {
    calculateNotCompliant,
    addStreamErrorsToSummary,
    addWarningsToSummary,
};
