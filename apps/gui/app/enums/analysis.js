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
        invalid_delta_rtp_ts_vs_nt: 'errors.invalid_delta_rtp_ts_vs_nt',
    },
    warnings: {
        pcap: {
            truncated: 'warnings.pcap.truncated',
        },
    },
    analysesNames: {
        rtp: 'RTP',
        rtp_sequence: 'RTP sequence',
        '2110_21_cinst': 'SMPTE 2110-21 (Cinst)',
        '2110_21_vrx': 'SMPTE 2110-21 (VRX)',
        tsdf: 'EBU TS-DF',
        rtp_ts_vs_pkt_ts: 'RTP timestamps',
    },
};
