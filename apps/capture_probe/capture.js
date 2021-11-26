const os = require('os');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const recorder = require('./recorder');
const tcpdump = require('./tcpdump');
const dpdk = require('./dpdk');
const { uploadFile } = require('./upload');
const unlink = util.promisify(fs.unlink);

///////////////////////////////////////////////////////////////////////////////

const sleep = async (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

const performCaptureAndIngest = async (globalConfig, workflowConfig) => {
    const endpoints = workflowConfig.senders
        .map(sender => sender.sdp)
        .map(sdp => sdp.streams[0]);

    const captureFile = path.join(globalConfig.capture.destination, workflowConfig.id + '.pcap');

    const captureConfig = {
        endpoints: endpoints,
        durationMs: workflowConfig.durationMs,
        file: captureFile,
    };

    if (globalConfig.capture.engine === 'recorder') {
        await recorder.runRecorder(globalConfig, captureConfig);
    } else if (globalConfig.capture.engine === 'tcpdump') {
        while (await tcpdump.runTcpdump(globalConfig, captureConfig) == 2) {
            await sleep(1000);
        }
    } else if (globalConfig.capture.engine === 'dpdk') {
        while (await dpdk.runDpdkCapture(globalConfig, captureConfig) == 2) {
            await sleep(1000);
        }
    }

    try {
        await uploadFile(
            captureFile,
            workflowConfig.url,
            workflowConfig.authorization,
            workflowConfig.filename
        );
    } finally {
        await unlink(captureFile);
    }
};

module.exports = {
    performCaptureAndIngest,
};
