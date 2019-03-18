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
        missing_information: 'missing_information',
        invalid_delta_rtp_ts_vs_nt: 'errors.invalid_delta_rtp_ts_vs_nt',
        cinst_above_maximum: 'errors.cinst_above_maximum',
        vrx_above_maximum: 'errors.vrx_above_maximum',
    },
    warnings: {
        pcap: {
            truncated: 'warnings.pcap.truncated'
        }
    }
};

