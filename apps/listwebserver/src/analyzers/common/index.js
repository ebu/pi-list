const { doRtpStreamAnalysis } = require('../rtp');
const { doMulticastAddressAnalysis } = require('../multicast');
const { validateMulticastAddresses } = require('../utils');
const { api } = require('@bisect/ebu-list-sdk');

async function doCommonConsolidation(pcapId, streams) {
    await doMulticastAddressAnalysis(pcapId, streams);

    const promises = streams.map(async (stream) => {
        if (stream.processing === undefined) {
            stream.processing = { extractedFrames: api.pcap.ProcessingState.idle };
        } else {
            stream.processing.extractedFrames = api.pcap.ProcessingState.idle;
        }

        await validateMulticastAddresses(stream);
        await doRtpStreamAnalysis(stream);
    });

    return Promise.all(promises);
}

function doConsolidateNotCompliantInfo(pcap) {}

module.exports = {
    doCommonConsolidation,
};
