import { isString } from 'lodash';

const VIDEO_PROFILES = {
    '1080i50-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1920,
        height: 1080,
        scan_type: 'interlaced',
        rate: '50',
        colorimetry: 'BT709',
    },
    '1080i5994-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1920,
        height: 1080,
        scan_type: 'interlaced',
        rate: '60000/1001',
        colorimetry: 'BT709',
    },
    '720p50-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1280,
        height: 720,
        scan_type: 'progressive',
        rate: '50',
        colorimetry: 'BT709',
    },
    '720p5994-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1280,
        height: 720,
        scan_type: 'progressive',
        rate: '60000/1001',
        colorimetry: 'BT709',
    },
    '1080p24-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1920,
        height: 1080,
        scan_type: 'progressive',
        rate: '24',
        colorimetry: 'BT709',
    },
    '1080p25-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1920,
        height: 1080,
        scan_type: 'progressive',
        rate: '25',
        colorimetry: 'BT709',
    },
    '1080p2997-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1920,
        height: 1080,
        scan_type: 'progressive',
        rate: '30000/1001',
        colorimetry: 'BT709',
    },
    '1080p50-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1920,
        height: 1080,
        scan_type: 'progressive',
        rate: '50',
        colorimetry: 'BT709',
    },
    '1080p5994-422-10bits': {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 1920,
        height: 1080,
        scan_type: 'progressive',
        rate: '60000/1001',
        colorimetry: 'BT709',
    },
    pal: {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 720,
        height: 576,
        scan_type: 'interlaced',
        rate: '50',
        colorimetry: 'BT601',
    },
    ntsc: {
        sampling: 'YCbCr-4:2:2',
        color_depth: 10,
        width: 720,
        height: 480,
        scan_type: 'interlaced',
        rate: '60000/1001',
        colorimetry: 'BT601',
    },
};

const AUDIO_PROFILES = {
    'L16-48k-2ch-1ms': {
        encoding: 'L16',
        sampling: '48000',
        number_channels: 2,
        packet_time: '1.000000',
    },
    'L24-48k-2ch-125us': {
        encoding: 'L24',
        sampling: '48000',
        number_channels: 2,
        packet_time: '0.125000',
    },
};

/**
 * This code will be used for DEMO PURPOSES
 * @retuns {Promise} - This promise will be used to simulate an API request in order to get the video presets
 */
export function getVideoProfiles() {
    return new Promise(resolve => {
        resolve([
            {
                label: '1080i50 / 4:2:2 / 10 bit',
                value: '1080i50-422-10bits',
            },
            {
                label: '1080i59.94 / 4:2:2 / 10 bit',
                value: '1080i5994-422-10bits',
            },
            {
                label: '720p50 / 4:2:2 / 10 bit',
                value: '720p50-422-10bits',
            },
            {
                label: '720p59.94 / 4:2:2 / 10 bit',
                value: '720p5994-422-10bits',
            },
            {
                label: '1080p24 / 4:2:2 / 10 bit',
                value: '1080p24-422-10bits',
            },
            {
                label: '1080p25 / 4:2:2 / 10 bit',
                value: '1080p25-422-10bits',
            },
            {
                label: '1080p29.97 / 4:2:2 / 10 bit',
                value: '1080p2997-422-10bits',
            },
            {
                label: '1080p50 / 4:2:2 / 10 bit',
                value: '1080p50-422-10bits',
            },
            {
                label: '1080p59.94 / 4:2:2 / 10 bit',
                value: '1080p5994-422-10bits',
            },
            {
                label: 'PAL',
                value: 'pal',
            },
            {
                label: 'NTSC',
                value: 'ntsc',
            },
        ]);
    });
}

export function getAudioProfiles() {
    return new Promise(resolve => {
        resolve([
            {
                label: 'L16 / 48kHz / 2 channels / 1 millisecond',
                value: 'L16-48k-2ch-1ms',
            },
            {
                label: 'L24 / 48kHz / 2 channels / 125 microseconds',
                value: 'L24-48k-2ch-125us',
            },
        ]);
    });
}

export function getVideoInformationByProfile(profile) {
    const defaults = isString(profile)
        ? VIDEO_PROFILES[profile]
        : { colorimetry: 'unknown' };

    const newVideo = Object.assign(
        {},
        defaults
    );

    if (newVideo.colorimetry === undefined) {
        newVideo.colorimetry = 'unknown';
    }

    return newVideo;
}

export function getAudioInformationByProfile(profile) {
    const defaults = AUDIO_PROFILES[profile];
    return Object.assign({}, defaults);
}
