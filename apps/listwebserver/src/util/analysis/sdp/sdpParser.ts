import { api } from '@bisect/ebu-list-sdk';
import loggerFactory from '../../logger';
import sdpParser from 'sdp-transform';
import { isArray } from 'lodash';
const logger = loggerFactory('parse-sdp');

function parseSDP(sdpText: string): sdpParser.SessionDescription {
    const parsed = sdpParser.parse(sdpText);
    // logger.info(`Parsed SDP: ${JSON.stringify(parsed, null, '    ')}`);
    return parsed;
}

export function parseSDPs(sdps: string[]): sdpParser.SessionDescription[] {
    return sdps.map(parseSDP);
}

type MediaItem = {
    type: string;
    port: number;
    protocol: string;
    payloads?: string | undefined;
} & sdpParser.MediaDescription;

function getMediaType(media: MediaItem): api.pcap.FullMediaType | undefined {
    if (!isArray(media.rtp)) {
        logger.error('No RTP entry');
        return undefined;
    }

    if (media.rtp.length !== 1) {
        logger.error('RTP entry does not have length 1');
        return undefined;
    }

    return `${media.type}/${media.rtp[0].codec}` as api.pcap.FullMediaType;
}

function getAddress(media: MediaItem): string | undefined {
    return media.connection?.ip;
}

function parseAddress(ip?: string): string | undefined {
    if (ip === undefined) {
        logger.error('Destination address is not defined');
        return undefined;
    }
    return ip.replace(/\/.*$/, '');
}

function getPort(media: MediaItem): number {
    return media.port;
}

function getMappingFromSDP(media: MediaItem): api.pcap.IMediaTypeMapEntry | undefined {
    const media_type = getMediaType(media);
    if (media_type === undefined) return undefined;
    const address = parseAddress(getAddress(media));
    if (address === undefined) return undefined;

    return {
        destination: {
            address,
            port: getPort(media),
        },
        media_type,
    };
}

function getMappingsFromSDP(sdp: sdpParser.SessionDescription): api.pcap.IMediaTypeMapEntry[] {
    return sdp.media.map(getMappingFromSDP).filter((x) => x !== undefined) as api.pcap.IMediaTypeMapEntry[];
}

export function getMappingsFromSDPs(sdps: sdpParser.SessionDescription[]): api.pcap.IMediaTypeMapEntry[] {
    const mappingArrays = sdps.map(getMappingsFromSDP);
    return mappingArrays.flat();
}
