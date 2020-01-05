// *********************************************************
// ******************** ATTENTION **************************
// This file has to be the same in listwebserver and gui
// *********************************************************

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
};
