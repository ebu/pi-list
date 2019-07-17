const { getVideoMeta } = require('./sdp');

test('sdp getVideoMeta: no media', () => {
    const m = undefined;
    const expected = {};
    expect(getVideoMeta(m)).toStrictEqual(expected);
});

test('sdp getVideoMeta: no fmtp', () => {
    const m = {};
    const expected = {};
    expect(getVideoMeta(m)).toStrictEqual(expected);
});

test('sdp getVideoMeta: fmtp is empty', () => {
    const m = { fmtp: [] };
    const expected = {};
    expect(getVideoMeta(m)).toStrictEqual(expected);
});

test('sdp getVideoMeta: empty config', () => {
    const m = { fmtp: [{ config: '' }] };
    const expected = {};
    expect(getVideoMeta(m)).toStrictEqual(expected);
});

test('sdp getVideoMeta: sample_1', () => {
    const m = {
        fmtp: [
            {
                config:
                    'sampling=YCbCr-4:2:2; width=1920; height=1080; depth=10; progressive; exactframerate=50; TCS=SDR; colorimetry=BT709; PM=2110GPM; SSN=ST2110-20:2017; TP=2110TPN',
            },
        ],
    };

    const expected = {
        PM: '2110GPM',
        SSN: 'ST2110-20:2017',
        TCS: 'SDR',
        TP: '2110TPN',
        colorimetry: 'BT709',
        depth: '10',
        exactframerate: '50',
        height: '1080',
        sampling: 'YCbCr-4:2:2',
        width: '1920',
        progressive: true,
        resolution: '1920x1080p50',
    };

    expect(getVideoMeta(m)).toStrictEqual(expected);
});

const { getAudioMeta } = require('./sdp');

test('sdp getAudioMeta: no media', () => {
    const m = undefined;
    const expected = {};
    expect(getAudioMeta(m)).toStrictEqual(expected);
});

test('sdp getAudioMeta: no fmtp', () => {
    const m = {};
    const expected = {};
    expect(getAudioMeta(m)).toStrictEqual(expected);
});

test('sdp getAudioMeta: fmtp is empty', () => {
    const m = { rtp: [] };
    const expected = {};
    expect(getAudioMeta(m)).toStrictEqual(expected);
});

test('sdp getAudioMeta: empty config', () => {
    const m = { rtp: [{}] };
    const expected = {};
    expect(getAudioMeta(m)).toStrictEqual(expected);
});

test('sdp getAudioMeta: sample_1', () => {
    const m = {
        rtp: [
            {
                codec: 'L24',
                encoding: 10,
                rate: 48000,
            },
        ],
    };

    const expected = {
        codec: 'L24',
        encoding: 10,
        rate: 48000,
        resolution: 'L24 / 10 bit / 48000 Hz',
    };

    expect(getAudioMeta(m)).toStrictEqual(expected);
});
