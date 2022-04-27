const _ = require('lodash');
const constants = require('../enums/analysis');

function appendError(stream, value) {
    const errors = _.get(stream, 'error_list', []);
    errors.push(value);
    _.set(stream, 'error_list', errors);
    return stream;
}

function validateMulticastAddresses(stream) {
    const networkInfo = _.get(stream, 'network_information');
    const analyses = _.get(stream, 'analyses')

    if (networkInfo.valid_multicast_mac_address == false) {
        stream = _.set(
            stream,
            'analyses.destination_multicast_mac_address.result',
            constants.outcome.not_compliant
        );
        stream = appendError(stream, {
            id: constants.errors.invalid_multicast_mac_address,
        });
    } else {
        stream = _.set(
            stream,
            'analyses.destination_multicast_mac_address.result',
            constants.outcome.compliant
        );
    }

    if (networkInfo.valid_multicast_ip_address == false) {
        stream = _.set(
            stream,
            'analyses.destination_multicast_ip_address.result',
            constants.outcome.not_compliant
        );
        stream = appendError(stream, {
            id: constants.errors.invalid_multicast_ip_address,
        });
    } else {
        stream = _.set(
            stream,
            'analyses.destination_multicast_ip_address.result',
            constants.outcome.compliant
        );
    }

    if (analyses?.mac_address_analysis?.result === "not_compliant") {
        stream = appendError(stream, { id: constants.errors.repeated_mac_addresses });
    }

    if (networkInfo.multicast_address_match == false) {
        stream = _.set(
            stream,
            'analyses.unrelated_multicast_addresses.result',
            constants.outcome.not_compliant
        );
        stream = appendError(stream, {
            id: constants.errors.unrelated_multicast_addresses,
        });
    } else {
        stream = _.set(
            stream,
            'analyses.unrelated_multicast_addresses.result',
            constants.outcome.compliant
        );
    }

    return stream;
}

module.exports = {
    appendError,
    validateMulticastAddresses,
};
