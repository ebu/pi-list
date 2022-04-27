// *********************************************************
// ******************** ATTENTION **************************
// This file has to be the same in listwebserver and gui
// *********************************************************

/* For details about audio profiles, see `docs/audio_timing_analysis.md` */

const JTNMAudioRtpProfile = {
    unit: 'μs',
    min: 0,
    maxAvg: 1000, // same as max to inhibit the impact for this profile
    max: 1000,
};

const CBCAudioRtpProfile = {
    unit: 'packet_time',
    min: 0,
    maxAvg: 3,
    max: 19,
};

const EBUAudioTsdfProfile = {
    tolerance: 1,
    limit: 17,
    unit: 'packet_time',
};

const profiles = [
    {
        id: '5b2203b2-0aec-40fa-b0da-2f36a1c06af6',
        label: 'JT-NM Tested 2020',
        timestamps: {
            source: 'pcap',
        },
        audio: {
            deltaPktTsVsRtpTsLimit: JTNMAudioRtpProfile,
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
            deltaPktTsVsRtpTsLimit: JTNMAudioRtpProfile,
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

module.exports = {
    outcome: {
        not_compliant: 'not_compliant',
        compliant: 'compliant',
        undefined: 'undefined',
    },
    errors: {
        //
        // Whenever a new value is added here, a corresponding translation must be added too
        //

        missing_information: 'errors.missing_information',
        invalid_rtp_ts_vs_nt: 'errors.invalid_rtp_ts_vs_nt',
        invalid_delta_packet_ts_vs_rtp_ts: 'errors.invalid_delta_packet_ts_vs_rtp_ts',
        invalid_inter_frame_rtp_ts_delta: 'errors.invalid_inter_frame_rtp_ts_delta',
        cinst_above_maximum: 'errors.cinst_above_maximum',
        vrx_above_maximum: 'errors.vrx_above_maximum',
        tsdf_not_compliant: 'errors.tsdf_not_compliant',
        audio_rtp_ts_not_compliant: 'errors.audio_rtp_ts_not_compliant',
        dropped_packets: 'errors.dropped_packets',
        invalid_multicast_mac_address: 'errors.invalid_multicast_mac_address',
        invalid_multicast_ip_address: 'errors.invalid_multicast_ip_address',
        unrelated_multicast_addresses: 'errors.unrelated_multicast_addresses',
        shared_multicast_destination_ip_address: 'errors.shared_multicast_destination_ip_address',
        ttml_time_base_is_not_media: 'errors.ttml_time_base_is_not_media',
        ttml_inconsistent_sequence_identifier: 'errors.ttml_inconsistent_sequence_identifier',
        invalid_marker_bit: 'errors.invalid_marker_bit',
        invalid_field_bits: 'errors.invalid_field_bits',
        ancillary_invalid_payload: 'errors.ancillary_invalid_payload',
        repeated_mac_addresses: "errors.repeated_mac_addresses"
    },
    warnings: {
        pcap: {
            truncated: 'warnings.pcap.truncated',
        },
    },
    qualitative: {
        narrow: 'narrow',
        wide: 'wide',
        not_compliant: 'not_compliant',
    },
    profiles: profiles,
};
