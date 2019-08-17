const os = require('os');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const recorder = require('./recorder');
const { uploadFile } = require('./upload');
const unlink = util.promisify(fs.unlink);

///////////////////////////////////////////////////////////////////////////////

const performCaptureAndIngest = async (globalConfig, workflowConfig) => {
    const endpoints = workflowConfig.senders
        // .map(sender => _.get(sender, ['sdp', 'streams[0]'], null)) // lodash is not doing this
        .map(sender => sender.sdp)
        .map(sdp => sdp.streams[0]);

    const captureFile = path.join(os.tmpdir(), workflowConfig.id + '.pcap');

    const captureConfig = {
        endpoints: endpoints,
        durationMs: workflowConfig.durationMs,
        file: captureFile,
    };

    if (globalConfig.recorder) {
        await recorder.runRecorder(globalConfig, captureConfig);
    } else if (globalConfig.tcpdump) {
        await recorder.runTcpdump(globalConfig, captureConfig);
    }

    try {
        await uploadFile(
            captureFile,
            workflowConfig.ingestPutUrl,
            workflowConfig.cookie,
            workflowConfig.filename
        );
    } finally {
        await unlink(captureFile);
    }
};

module.exports = {
    performCaptureAndIngest,
};
