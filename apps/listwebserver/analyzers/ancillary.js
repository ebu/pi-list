const Stream = require('../models/stream');
const { appendError, validateMulticastAddresses } = require('./utils');

function doAncillaryStreamAnalysis (pcapId, stream) {
    return new Promise((resolve, reject) => {
		resolve(validateMulticastAddresses(stream));
	})
        .then(info => Stream.findOneAndUpdate({ id: stream.id }, info, { new: true }))
}

function doAncillaryAnalysis (pcapId, stream) {
    const promises = stream.map(stream => doAncillaryStreamAnalysis(pcapId, stream));
    return Promise.all(promises);
}

module.exports = {
    doAncillaryAnalysis
};

