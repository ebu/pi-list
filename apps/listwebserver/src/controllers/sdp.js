const util = require('util');
const fs = require('fs');
const logger = require('../util/logger');
const sdpParser = require('sdp-transform');
const sdpoker = require('sdpoker');
const uuidv1 = require('uuid/v1');
import { api } from '@bisect/ebu-list-sdk';
const { getMediaSpecificMeta, getIpInfoFromSdp } = require('../util/sdp');

const readFileAsync = util.promisify(fs.readFile);

const sdpToSource = (sdpText) => {
    const rfcErrors = sdpoker.checkRFC4566(sdpText, {});
    const st2110Errors = sdpoker.checkST2110(sdpText, {});
    const errors = rfcErrors.concat(st2110Errors);
    if (errors.length !== 0) {
        // notify instead of printing
        logger('sdp-check').error(`Found ${errors.length} error(s) in SDP file:`);
        for (let c in errors) {
            logger('sdp-check').error(`${+c + 1}: ${errors[c].message}`);
        }
    }

    const parsed = sdpParser.parse(sdpText);
    logger('sdp-parse').info(`sdpToSource - Parsed: ${JSON.stringify(parsed)}`);

    // grab src and dst IPs for each stream
    const streams = getIpInfoFromSdp(parsed);

    const source = {
        id: uuidv1(),
        meta: {
            label: parsed.name || 'Sender from SDP',
        },
        kind: api.capture.kinds.from_sdp,
        sdp: {
            raw: sdpText,
            streams,
            errors: errors.map((err) => err.message),
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

const sdpFileToSource = async (sdpPath) => {
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
