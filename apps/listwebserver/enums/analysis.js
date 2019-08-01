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
        missing_information: 'errors.missing_information',
        invalid_delta_rtp_ts_vs_nt: 'errors.invalid_delta_rtp_ts_vs_nt',
        cinst_above_maximum: 'errors.cinst_above_maximum',
        vrx_above_maximum: 'errors.vrx_above_maximum',
        tsdf_not_compliant: 'errors.tsdf_not_compliant',
        audio_rtp_ts_not_compliant: 'errors.audio_rtp_ts_not_compliant',
        dropped_packets: 'errors.dropped_packets',
    },
    warnings: {
        pcap: {
            truncated: 'warnings.pcap.truncated'
        }
    },
    qualitative: {
        narrow: 'narrow',
        wide: 'wide',
        not_compliant: 'not_compliant',
    }
};

