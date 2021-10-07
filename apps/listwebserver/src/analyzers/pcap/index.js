const Pcap = require('../../models/pcap');
const { calculateNotCompliant, addStreamErrorsToSummary, addWarningsToSummary } = require('./utils');

async function doPcapConsolidation(pcapId, streams, analysis_profile) {
    const summary = {
        error_list: [],
        warning_list: [],
    };

    streams.forEach((stream) => addStreamErrorsToSummary(stream, summary.error_list));

    const pcap = await Pcap.findOne({ id: pcapId }).exec();
    const not_compliant_streams = calculateNotCompliant(streams);

    addWarningsToSummary(pcap, summary.warning_list);
    await Pcap.findOneAndUpdate({ id: pcapId }, { summary, analysis_profile, not_compliant_streams }).exec();
}

module.exports = {
    doPcapConsolidation,
};
