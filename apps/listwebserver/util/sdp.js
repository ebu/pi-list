const _ = require('lodash');
const sdpParser = require('sdp-transform');
const logger = require('../util/logger');

function getIpInfoFromSdp(sdp) {
    // grab src and dst IPs for each stream
    const streams = sdp.media.map(function(media) {
        const dstAddr = _.get(media, 'sourceFilter.destAddress');
        const dstPort = _.get(media, 'port');
        const srcAddr = _.get(media, 'sourceFilter.srcList');
        return { dstAddr, dstPort, srcAddr };
    });

    return streams;
}

const withEqualRe = /\s*(.*)=(.*)\s*/;
const standAloneRe = /\s*(.*)\s*/;

const mapConfigToObject = config => {
    if (!config) return {};
    const items = config.split(';');
    return items.reduce((acc, cur) => {
        const m = cur.match(withEqualRe);
        if (m) {
            acc[m[1]] = m[2];
        } else {
            const standAlone = cur.match(standAloneRe);
            if (standAlone) {
                acc[standAlone[1]] = true;
            }
        }

        return acc;
    }, {});
};

const getResolutionFromProperties = properties => {
    if (!properties) return undefined;

    if (
        properties.width === undefined ||
        properties.height === undefined ||
        properties.exactframerate === undefined
    ) {
        return undefined;
    }

    const structureTag = properties.progressive ? 'p' : 'i';

    return `${properties.width}x${properties.height}${structureTag}${
        properties.exactframerate
    }`;
};

const getVideoMeta = media => {
    const config = _.get(media, 'fmtp[0].config');
    const properties = mapConfigToObject(config);
    const resolution = getResolutionFromProperties(properties);
    if (resolution) {
        properties.resolution = resolution;
    }

    return properties;
};

const getAudioMeta = media => {
    const rtp0 = _.get(media, 'rtp[0]');
    if (!rtp0) {
        return {};
    }

    const properties = {
        ...rtp0,
    };

    if (
        rtp0.encoding !== undefined &&
        rtp0.rate !== undefined
    ) {
        properties.resolution = `${rtp0.encoding} bit / ${
            rtp0.rate
        } Hz`;
    }

    return properties;
};

const getDataMeta = media => {
    return {};
};

const getMediaSpecificMeta = media => {
    if (!media.rtp || media.rtp.length === 0) {
        logger('sdp-controller').error('SDP has no media.rtp entries');
        return undefined;
    }

    const codec = media.rtp[0].codec;

    switch (media.type) {
        case 'video':
            switch (codec) {
                case 'raw':
                    return {
                        format: 'urn:x-nmos:format:video',
                        video: getVideoMeta(media),
                    };

                case 'smpte291':
                        return {
                            format: 'urn:x-nmos:format:data',
                            data: getDataMeta(media),
                        };

                default:
                    logger('sdp-controller').error(
                        'Unknown coded for media type video in SDP: ${codec}'
                    );
                    return undefined;
            }
            break;

        case 'audio':
            return {
                format: 'urn:x-nmos:format:audio',
                audio: getAudioMeta(media)    
            };

        default:
            logger('sdp-controller').error(
                'Unknown media.type in SDP: ${media.type}'
            );
            return undefined;
    }
};

module.exports = {
    getVideoMeta,
    getAudioMeta,
    getDataMeta,
    getMediaSpecificMeta,
    getIpInfoFromSdp,
};
