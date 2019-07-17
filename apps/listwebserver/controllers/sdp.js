const util = require('util');
const fs = require('fs');
const logger = require('../util/logger');
const sdpParser = require('sdp-transform');
const uuidv1 = require('uuid/v1');
const sourcesModel = require('../../../js/common/capture/sources');
const { getMediaSpecificMeta, getIpInfoFromSdp } = require('../util/sdp');

const readFileAsync = util.promisify(fs.readFile);

const sdpToSource = sdpText => {
    const parsed = sdpParser.parse(sdpText);

    // grab src and dst IPs for each stream
    const streams = getIpInfoFromSdp(parsed);

    const source = {
        id: uuidv1(),
        meta: {
            label: parsed.name || 'Sender from SDP',
        },
        kind: sourcesModel.kinds.from_sdp,
        sdp: {
            raw: sdpText,
            streams,
        },
    };

    if (!parsed.media || parsed.media.length === 0) {
        logger('sdp-controller').error('SDP has no media entries');
        return source;
    }

    const media = parsed.media[0];
    const meta = getMediaSpecificMeta(media);
    source.meta = { ...source.meta, ...meta };

    return source;
};

const sdpFileToSource = async sdpPath => {
    try {
        const sdpText = await readFileAsync(sdpPath);
        return sdpToSource(sdpText.toString());
    } catch (err) {
        logger('sdp-controller').error('Error parsing SDP file', err);
        throw err;
    }
};

module.exports = {
    sdpToSource,
    sdpFileToSource,
};
