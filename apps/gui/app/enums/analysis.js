// *********************************************************
// ******************** ATTENTION **************************
// This file has to be the same in listwebserver and gui
// *********************************************************

module.exports = {
    outcome: {
        not_compliant: 'not_compliant',
        compliant: 'compliant',
    },
    errors: {
        invalid_rtp_ts_vs_nt: 'errors.invalid_rtp_ts_vs_nt',
    },
    warnings: {
        pcap: {
            truncated: 'warnings.pcap.truncated',
        },
    },
    analysesNames: {
        rtp_ts_vs_nt: 'Delta between RTP timestamps and (N x Tframe) in ticks',
        packet_ts_vs_rtp_ts: 'Delta between packet capture timestamps and RTP timestamps in ns',
        inter_frame_rtp_ts_delta: 'Inter-frame RTP timestamps delta',
        rtp_sequence: 'RTP sequence',
        '2110_21_cinst': 'SMPTE 2110-21 (Cinst)',
        '2110_21_vrx': 'SMPTE 2110-21 (VRX)',
        tsdf: 'EBU TS-DF',
        destination_multicast_mac_address: 'Destination Multicast MAC address',
        destination_multicast_ip_address: 'Destination Multicast IP address',
        unrelated_multicast_addresses: 'Multicast MAC and IP addresses mapping',
        unique_multicast_destination_ip_address: 'Unique destination Multicast IP address',
        ttml_time_base_is_media: 'TTML timeBase is "media"',
        ttml_consistent_sequence_identifier: 'TTML consistent sequenceIdentifier',
        ttml_inconsistent_sequence_identifier: 'TTML inconsistent sequenceIdentifier',
        pkts_per_frame: 'RTP packets per frame/field',
        marker_bit: 'RTP marker bit',
    },
};
