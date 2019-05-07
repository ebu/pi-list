const logger = require('../util/logger');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const API_ERRORS = require('../enums/apiErrors');
const jetpack = require('fs-jetpack');
const os = require('os');
const path = require('path');
const { generateRandomPcapFilename } = require('../util/ingest');
const program = require('../util/programArguments');
const { runTcpdump } = require('../util/capture/tcpdump')
const { runRecorder } = require('../util/capture/recorder')

function performCapture(req, res, next) {
    logger('live').info(`Received: ${JSON.stringify(req.body)}`);

    if (!program.capture || !program.capture.interfaceName) {
        throw new Error('program.capture.interfaceName not set in configuration file');
    }

    const captureOptions = {
        file: undefined,
        durationMs: undefined,
        interfaceName: undefined,
        snapshotLengthBytes: undefined,
        streamEndpoints: []
    };

    const new_pcap_filename = generateRandomPcapFilename();
    captureOptions.file = path.join(os.tmpdir(), new_pcap_filename);
    const destinationFile = `${req.pcap.folder}/${new_pcap_filename}`;
    captureOptions.durationMs = req.body.duration || 500;
    captureOptions.snapshotLengthBytes = program.capture.snapshotLength;
    captureOptions.interfaceName = program.capture.interfaceName;
    captureOptions.streamEndpoints = req.body.streams ? req.body.streams.filter(f => f.dstAddr && f.dstPort) : [];

    if (captureOptions.streamEndpoints == 0) {
        next('no endpoints');
        return;
    }

    // sets req.file, which is used by the ingest system
    req.file = {
        path: destinationFile,
        originalname: req.body.name,
        filename: new_pcap_filename
    };

    const runner = runRecorder;
    // const runner = runTcpdump;

    runner(captureOptions)
        .then(() => {
            jetpack.copyAsync(captureOptions.file, destinationFile)
                .then(() => {
                    jetpack.remove(captureOptions.file);
                    res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send();
                    next();
                })
                .catch((e) => {
                    logger('live').error(`Could not copy pcap file: ${e}`);
                    res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.UNEXPECTED_ERROR);
                });
        })
        .catch(e => {
            logger('live').error(`Error capturing: ${e}`);
            jetpack.remove(captureOptions.file);
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send({
                code: 'CAPTURE_ERROR',
                message: e.toString()
            });
        });
};

module.exports = {
    performCapture
};
