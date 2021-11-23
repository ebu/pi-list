const { uploadFile } = require('./upload');

///////////////////////////////////////////////////////////////////////////////

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const ingestFromFile = async (globalConfig, workflowConfig) => {
    const pcapFile = globalConfig.interfaces;

    await sleep(workflowConfig.durationMs + 3000); // simulate real capture + overhead

    uploadFile(
        pcapFile,
        workflowConfig.url,
        workflowConfig.authorization,
        workflowConfig.filename
    );
};

module.exports = {
    ingestFromFile
};
