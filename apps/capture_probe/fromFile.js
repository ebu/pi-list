const { uploadFile } = require('./upload');

///////////////////////////////////////////////////////////////////////////////

const ingestFromFile = async (configuration) => {
    const sourceFile = config.dummy_pcap;

    uploadFile(
        sourceFile,
        configuration.ingestPutUrl,
        configuration.cookies,
        configuration.filename
    );
};

module.exports = {
    ingestFromFile
};
