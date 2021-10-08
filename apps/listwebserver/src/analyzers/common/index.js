const { doRtpStreamAnalysis } = require('../rtp');
const { doMulticastAddressAnalysis } = require('../multicast');
const { validateMulticastAddresses } = require('../utils');

async function doCommonConsolidation(pcapId, streams) {
    await doMulticastAddressAnalysis(pcapId, streams);

    const promises = streams.map(async (stream) => {
        await validateMulticastAddresses(stream);
        await doRtpStreamAnalysis(stream);
    });

    return Promise.all(promises);
}

function doConsolidateNotCompliantInfo(pcap) {}

module.exports = {
    doCommonConsolidation,
};
