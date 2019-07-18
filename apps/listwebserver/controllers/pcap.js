const Pcap = require('../models/pcap');
const Streams = require('./streams');

function getReport(pcapID) {
    const pcap = Pcap.findOne({ id: pcapID }).exec();

    const streams = Streams.getStreamsForPcap(pcapID);

    return Promise.all([ pcap, streams ])
        .then(([ pcap, streams ]) => {
            const pcapJ = pcap.toObject();
            const streamsJ = streams.map(o=> o.toObject());
            pcapJ.streams = streamsJ;
            return pcapJ;
        });
}

module.exports = {
    getReport
};
