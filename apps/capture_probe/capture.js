const os = require('os');
const path = require('path');
const fs = require('fs');
const util = require('util');
const recorder = require('./recorder');
const { uploadFile } = require('./upload');
const unlink = util.promisify(fs.unlink);

///////////////////////////////////////////////////////////////////////////////

const performCaptureAndIngest = async configuration => {
    const endpoints = configuration.senders
        // .map(sender => _.get(sender, ['sdp', 'streams[0]'], null)) // lodash is not doing this
        .map(sender => sender.sdp)
        .map(sdp => sdp.streams[0]);

    const captureFile = path.join(os.tmpdir(), configuration.id + '.pcap');

    const interface = config.capture.interface;
    const recorderBinPath = config.capture.bin;

    if (!interface || !recorderBinPath) {
        throw new Error(
            'capture interface or recorder bin path not defined in configuration file'
        );
    }

    const captureConfig = {
        endpoints: endpoints,
        durationMs: 1000,
        interfaceName: config.capture.interface,
        file: captureFile,
    };

    await recorder.runRecorder(recorderBinPath, captureConfig);

    try {
        await uploadFile(
            captureFile,
            configuration.ingestPutUrl,
            configuration.cookies,
            configuration.filename
        );
    } finally {
        await unlink(captureFile);
    }
};

module.exports = {
    performCaptureAndIngest,
};
