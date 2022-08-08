import SDK from '@bisect/ebu-list-sdk';

const JTNM2020AudioRtpProfile: SDK.api.pcap.IAudioRtpProfile = {
    min: [0, undefined, 'μs'],
    avg: [undefined, 1000, 'μs'], // same as max to inhibit the impact for this profile
    max: [undefined, 1000, 'μs'],
};

const CBCAudioRtpProfile: SDK.api.pcap.IAudioRtpProfile = {
    min: [0, undefined, 'packet_time'],
    avg: [undefined, 3, 'packet_time'],
    max: [undefined, 19, 'packet_time'],
};

const EBUAudioTsdfProfile: SDK.api.pcap.ITsdfProfile = {
    tolerance: 1,
    limit: 17,
    unit: 'packet_time',
};

const profiles: SDK.api.pcap.IAnalysisProfile[] = [
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
                min: [0, undefined, 'μs'],
                avg: [undefined, 2500, 'μs'], // same as max to inhibit the impact for this profile
                max: [undefined, 20, 'packet_time'],
            },
            tsdf: {
                tolerance: 1,
                limit: 17,
                unit: 'packet_time',
            },
        },
    },
    {
        id: '5b2203b2-0aec-40fa-b0da-2f36a1c06af6',
        label: 'JT-NM Tested 2020',
        timestamps: {
            source: 'pcap',
        },
        audio: {
            deltaPktTsVsRtpTsLimit: JTNM2020AudioRtpProfile,
            tsdf: EBUAudioTsdfProfile,
        },
    },
    {
        id: 'b89d08b5-0dc8-4860-b5d5-32d2a051957e',
        label: 'JT-NM Tested 2020 (use PTP packets to derive clock)',
        timestamps: {
            source: 'ptp_packets',
        },
        audio: {
            deltaPktTsVsRtpTsLimit: JTNM2020AudioRtpProfile,
            tsdf: EBUAudioTsdfProfile,
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
    },
];

export default profiles;
