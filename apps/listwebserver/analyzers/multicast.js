const _ = require('lodash');
const { appendError } = require('./utils');
const constants = require('../enums/analysis');
const Stream = require('../models/stream');

async function doMulticastAddressAnalysis(pcapId, streams) {
    let dstMulticastMap = {};

    streams.forEach(stream => {
        const address = stream.network_information.destination_address;
        const port = stream.network_information.destination_port;
        const key = `${address}:${port}`;
        const reusedAddress = Object.keys(dstMulticastMap).find(
            value => value === key
        );

        if (!reusedAddress) dstMulticastMap[key] = [stream];
        else dstMulticastMap[key].push(stream);
    });

    for (let [key, streamsArray] of Object.entries(dstMulticastMap)) {
        if (streamsArray.length > 1) {
            streamsArray.forEach(async stream => {
                const analysis = {
                    result: constants.outcome.not_compliant,
                    details: {
                        destination: key,
                    },
                };
                _.set(
                    stream,
                    'analyses.unique_multicast_destination_ip_address',
                    analysis
                );
                appendError(stream, {
                    id:
                        constants.errors
                            .shared_multicast_destination_ip_address,
                });
                await Stream.findOneAndUpdate({ id: stream.id }, stream, {
                    new: true,
                });
            });
        } else {
            const stream = streamsArray[0];
            const analysis = {
                result: constants.outcome.compliant,
            };

            _.set(
                stream,
                'analyses.unique_multicast_destination_ip_address',
                analysis
            );
            await Stream.findOneAndUpdate({ id: stream.id }, stream, {
                new: true,
            });
        }
    }
}

module.exports = {
    doMulticastAddressAnalysis,
};
