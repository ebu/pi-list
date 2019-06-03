const _ = require('lodash');
const sdpParser = require('sdp-transform');
const logger = require('../util/logger');

function getIpInfoFromSdp(sdp) {
    try {
        const parsed = sdpParser.parse(sdp.toString());

        // grab src and dst IPs for each stream
        const streams = parsed.media.map(function(media) {
            const dstAddr = _.get(media, 'sourceFilter.destAddress');
            const dstPort = _.get(media, 'port');
            const srcAddr = _.get(media, 'sourceFilter.srcList');
            return { dstAddr, dstPort, srcAddr };
        });

        return streams;
    } catch (err) {
        logger('spd').error(`Error parsing SDP: ${err}`);
    }

    return [];
}

module.exports = {
    getIpInfoFromSdp,
};
