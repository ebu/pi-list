import SDK from '@bisect/ebu-list-sdk';

const JTNM2020AudioRtpProfile: SDK.api.pcap.IAudioRtpProfile = {
    min: { min: 0, max: undefined, unit: 'μs' },
    avg: { min: undefined, max: 1000, unit: 'μs' }, // same as max to inhibit the impact for this profile
    max: { min: undefined, max: 1000, unit: 'μs' },
};

const CBCAudioRtpProfile: SDK.api.pcap.IAudioRtpProfile = {
    min: { min: 0, max: undefined, unit: 'packet_time' },
    avg: { min: undefined, max: 3, unit: 'packet_time' },
    max: { min: undefined, max: 19, unit: 'packet_time' },
};

const EBUAudioTsdfProfile: SDK.api.pcap.ITsdfProfile = {
    tolerance: 1,
    limit: 17,
    unit: 'packet_time',
};

const jtnm2020: SDK.api.pcap.IAnalysisProfile = {
    id: '5b2203b2-0aec-40fa-b0da-2f36a1c06af6',
    label: 'JT-NM Tested 2020',
    timestamps: {
        source: 'pcap',
    },
    audio: {
        deltaPktTsVsRtpTsLimit: JTNM2020AudioRtpProfile,
        tsdf: EBUAudioTsdfProfile,
    },
    validationMap: {
        video: {
            rtp_ts_vs_nt: {
                type: 'use_troffset',
            },
        },
    },
};

export const profiles: SDK.api.pcap.IAnalysisProfile[] = [
    {
        id: '17555997-661c-451a-a682-d79299e4dbda',
        label: 'JT-NM Tested 2022',
        timestamps: {
            source: 'pcap',
        },
        audio: {
            // 6.4. ST 2110-30 RTP-Timestamp-test
            deltaPktTsVsRtpTsLimit: {
                // min:
                // The instantaneous value of the RTP timestamp is expected not to be in the future.
                // It should be measured between 1 packet time in the past and a tolerance corresponding
                // to the encapsulation time (1 packet time)
                min: { min: 0, max: undefined, unit: 'μs' },
                avg: { min: undefined, max: 2500, unit: 'μs' }, // same as max to inhibit the impact for this profile
                max: { min: undefined, max: 20, unit: 'packet_time' },
            },
            tsdf: {
                tolerance: 1,
                limit: 17,
                unit: 'packet_time',
            },
            pit: {
                min: { min: undefined, max: undefined, unit: 'μs' },
                avg: { min: 0.99, max: 1.01, unit: 'packet_time' },
                max: { min: undefined, max: 17, unit: 'packet_time' },
            },
        },
        validationMap: {},
    },
    jtnm2020,
    {
        ...jtnm2020,
        id: 'b89d08b5-0dc8-4860-b5d5-32d2a051957e',
        label: 'JT-NM Tested 2020 (use PTP packets to derive clock)',
        timestamps: {
            source: 'ptp_packets',
        },
    },
    {
        id: 'b89d08b5-0dc8-4860-b5d5-32d2a0519f73',
        label: 'CBC',
        timestamps: {
            source: 'pcap',
        },
        audio: {
            deltaPktTsVsRtpTsLimit: CBCAudioRtpProfile,
            tsdf: EBUAudioTsdfProfile,
        },
        validationMap: {
            video: {
                rtp_ts_vs_nt: {
                    type: 'use_troffset',
                },
            },
        },
    },
];
