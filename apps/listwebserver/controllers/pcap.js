const Pcap = require('../models/pcap');
const pdfReport = require('../util/pdfReport');
const Streams = require('./streams');

async function getReport(pcapID, type) {
    if (type === 'json') return await getJsonReport(pcapID);
    else if (type === 'pdf') return await getPdfReport(pcapID);
    else return Promise.reject(new Error('Invalid or missing report type.'));
}

async function getJsonReport(pcapId) {
    const pcap = await Pcap.findOne({ id: pcapId }).exec();

    const streams = await Streams.getStreamsForPcap(pcapId);
    const pcapJ = pcap.toObject();
    const streamsJ = streams.map(o => o.toObject());
    pcapJ.streams = streamsJ;
    return pcapJ;
}

async function getPdfReport(pcapId) {
    const jsonReport = await getJsonReport(pcapId);
    return await pdfReport.generate(jsonReport);
}

module.exports = {
    getReport,
};
