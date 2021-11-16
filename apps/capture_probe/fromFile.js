const { uploadFile } = require('./upload');

///////////////////////////////////////////////////////////////////////////////

const ingestFromFile = async (globalConfig, workflowConfig) => {
    const sourceFile = globalConfig.interfaces;

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
