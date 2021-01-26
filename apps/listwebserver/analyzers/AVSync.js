const Stream = require('../models/stream');

const createComparator = async (config) => {
    return {
        delay: {
            pkt: 0,
            rtp: 0,
            actual: 0, // compatibility with AA and VV for list in the UI
        },
        videoCursor: {
            pktTs: 0,
            rtpTs: 0,
            position: 0
        },
        audioCursor: {
            pktTs: 0,
            rtpTs: 0,
            position: 0
        },
        transparency: false, // transparency consistency with A2A and V2V comparison
    };
}


module.exports = {
    createComparator,
};
