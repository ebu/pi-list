const _ = require('lodash');
const { appendError} = require('./utils');
const constants = require('../enums/analysis');
const Stream = require('../models/stream');

async function doMulticastAddressAnalysis (pcapId, streams) {

    let dstMulticastMap = {};

    streams.forEach((stream) => {
        const address = stream.network_information.destination_address;
        const reusedAddress = Object.keys(dstMulticastMap).find(value => value === address);

        if (!reusedAddress)
            dstMulticastMap[address] = [stream];
        else dstMulticastMap[address].push(stream);
    });

    for (let [key, streamsArray] of Object.entries(dstMulticastMap)) {
        if (streamsArray.length > 1) {
            streamsArray.forEach(async (stream) => {
                stream = _.set(stream, 'analyses.unique_multicast_destination_ip_address.result', constants.outcome.not_compliant);
                stream = appendError(stream, {
                    id: constants.errors.shared_multicast_destination_ip_address
                });
                await Stream.findOneAndUpdate({ id: stream.id }, stream, { new: true });
            });
        }
        else {
            let stream = streamsArray[0];
            stream = _.set(stream, 'analyses.unique_multicast_destination_ip_address.result', constants.outcome.compliant);
            await Stream.findOneAndUpdate({ id: stream.id }, stream, { new: true });
        }
    }
}

module.exports = {
    doMulticastAddressAnalysis
};

