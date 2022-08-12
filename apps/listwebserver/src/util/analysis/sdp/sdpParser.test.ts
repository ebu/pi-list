import { api } from '@bisect/ebu-list-sdk';
import path from 'path';
import { SessionDescription } from 'sdp-transform';
import { parseSDPs, getMappingsFromSDPs } from './sdpParser';
import fs from 'fs';
import util from 'util';
const readFile = util.promisify(fs.readFile);

async function loadSDP(sdpFile: string): Promise<string> {
    // Go up and down so that it works with both src and the compiled output in dist
    const file = path.join(__dirname, '..', '..', '..', '..', 'src', 'util', 'analysis', 'sdp', '__data__', sdpFile);
    return (await readFile(file)).toString();
}

test('parse all: no SDPs', async () => {
    const sdps: string[] = [];
    const expected: SessionDescription[] = [];
    expect(parseSDPs(sdps)).toStrictEqual(expected);
});

test('parse all: JPEG XS', async () => {
    const sdp = await loadSDP('video_jxsv-2160p50.sdp');
    const sdps = [sdp];
    const parsed = parseSDPs(sdps);
    expect(parsed.length).toBe(1);
});

async function testGetMappings(file: string, expected: api.pcap.IMediaTypeMapEntry[]) {
    const sdp = await loadSDP(file);
    const parsed = parseSDPs([sdp]);
    const mapping = getMappingsFromSDPs(parsed);
    expect(mapping).toStrictEqual(expected);
}

test('get media type mapping: video/jxsv', async () => {
    testGetMappings('video_jxsv-2160p50.sdp', [
        {
            destination: {
                address: '239.0.22.17',
                port: 50022,
            },
            media_type: 'video/jxsv',
        },
        {
            destination: {
                address: '239.1.22.17',
                port: 50022,
            },
            media_type: 'video/jxsv',
        },
    ]);
});

test('get media type mapping: audio/am824', async () => {
    testGetMappings('audio_AM824.sdp', [
        {
            destination: {
                address: '239.1.1.1',
                port: 20000,
            },
            media_type: 'audio/AM824',
        },
    ]);
});

test('get media type mapping: audio/L24', async () => {
    testGetMappings('audio_L24.sdp', [
        {
            destination: {
                address: '239.1.1.1',
                port: 20000,
            },
            media_type: 'audio/L24',
        },
    ]);
});

test('get media type mapping: video/raw', async () => {
    testGetMappings('video_raw.sdp', [
        {
            destination: {
                address: '239.1.1.1',
                port: 50000,
            },
            media_type: 'video/raw',
        },
    ]);
});

test('get media type mapping: video/smpte291', async () => {
    testGetMappings('video_smpte291.sdp', [
        {
            destination: {
                address: '239.1.1.1',
                port: 20000,
            },
            media_type: 'video/smpte291',
        },
    ]);
});
