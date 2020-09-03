const { uploadFile } = require('./upload');

///////////////////////////////////////////////////////////////////////////////

const ingestFromFile = async (globalConfig, workflowConfig) => {
    const sourceFile = globalConfig.dummy_pcap;

    uploadFile(
        sourceFile,
        workflowConfig.ingestPutUrl,
        workflowConfig.authorization,
        workflowConfig.filename
    );
};

module.exports = {
    ingestFromFile
};
