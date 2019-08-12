const Pcap = require('../models/pcap');
const pdfReport = require('../util/pdfReport');
const Streams = require('./streams');

function getReport(pcapID, type) {

    if (type === 'json')
        return getJsonReport(pcapID);
    else if (type === 'pdf')
        return getPdfReport(pcapID);
    else return Promise.reject(new Error('Invalid or missing report type.'));
}

function getJsonReport (pcapId) {
    const pcap = Pcap.findOne({ id: pcapId }).exec();

    const streams = Streams.getStreamsForPcap(pcapId);

    return Promise.all([ pcap, streams ])
        .then(([ pcap, streams ]) => {
            const pcapJ = pcap.toObject();
            const streamsJ = streams.map(o=> o.toObject());
            pcapJ.streams = streamsJ;
            return pcapJ;
        });
}

function getPdfReport (pcapId) {

    return getJsonReport(pcapId)
        .then((jsonReport) => {
            console.log(JSON.stringify(jsonReport, null, 2));
            return pdfReport.generate(jsonReport);
        });
}

module.exports = {
    getReport
};

