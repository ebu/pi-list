const fs = require('fs');
const logger = require('./logger');
const { v1 : uuid  } = require('uuid');
const { LIST, types } = require('@bisect/ebu-list-sdk')

const uploadFile = async (pcapFile, url, authorization, filename) => {
    const list = new LIST(url);
    try {
        await list.setToken(authorization);
    } catch (err) {
        logger('probe').error(`probe ${err.message}`)
        return;
    }
    const version = await list.info.getVersion();
    if (version.major === undefined) {
        logger('probe').error(`Couldn't get version from ${url}`);
        return;
    }
    const pcapId = uuid();

    if (! url.includes('localhost')) {
        logger('probe').info('Upload pcap');
        const callback = (info) => console.log(`percentage: ${info.percentage}`);
        const stream = fs.createReadStream(pcapFile);
        await list.pcap.upload(filename, stream, callback, pcapId);
    } else {
        logger('probe').info('Upload local pcap');
        await list.pcap.uploadLocal(filename, pcapFile, pcapId);
    }
};

module.exports = {
    uploadFile,
};
