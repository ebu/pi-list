const router = require('express').Router();
const logger = require('../util/logger');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const API_ERRORS = require('../enums/apiErrors');
const LiveStream = require('../models/liveStream');
const fs = require('../util/filesystem');
var textEncoding = require('text-encoding');
var TextDecoder = textEncoding.TextDecoder;
const program = require('../util/programArguments');
const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const jetpack = require('fs-jetpack');

const { pcapIngest, generateRandomPcapDefinition, generateRandomPcapFilename } = require('../util/ingest');


function runTcpdump(req, res, next) {
    logger('live').info(`Received: ${JSON.stringify(req.body)}`);

    const new_pcap_filename = generateRandomPcapFilename();
    const temp_file = `/tmp/${new_pcap_filename}`;
    const destination_file = `${req.pcap.folder}/${new_pcap_filename}`;
    const duration_ms = req.body.duration || 500;

    // sets req.file, which is used by the ingest system
    req.file = {
        path: destination_file,
        originalname: req.body.name,
        filename: new_pcap_filename
    };

    if (!program.capture || !program.capture.interfaceName) {
        throw new Error('program.capture.interfaceName not set in configuration file');
    }

    const dst_filter = req.body.destination_address ? `dst ${req.body.destination_address}` : '';

    const tcpdumpProgram  = '/usr/sbin/tcpdump';

    const tcpdumpOptions = {
        // env: Object.assign({}, process.env, {
        //     LD_PRELOAD: 'libvma.so'
        // })
    };

    const tcpdumpArguments = [
        "-i", program.capture.interfaceName,
        dst_filter,
        "--time-stamp-precision=nano",
        "-j", "adapter_unsynced",
        "-c", "5000000",
        "-w", temp_file
    ];

    console.log(`${tcpdumpProgram} ${tcpdumpArguments.join(' ')}`);

    const childProcess = child_process.spawn(tcpdumpProgram,
        tcpdumpArguments,
        tcpdumpOptions
    );

    const tcpdumpOutput = [];
    const appendToOutput = (data) => {
        tcpdumpOutput.push(new TextDecoder("utf-8").decode(data));
    };

    childProcess.on('error', (err) => {
        console.log('error during capture:', err);
    });

    childProcess.stdout.on('data', appendToOutput);
    childProcess.stderr.on('data', appendToOutput);

    let killed = false;
    const onTimeout = () => {
        console.log('onTimeout');
        killed = true;
        childProcess.kill();
    };

    const timer = setTimeout(onTimeout, duration_ms);

    childProcess.on('close', (code) => {
        logger('live').info(`child process exited with code ${code}`);
        logger('live').info(tcpdumpOutput.join('\n'));

        clearTimeout(timer);

        jetpack.move(temp_file, destination_file);

        if (code === 0 || killed) {
            res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send();
            next();
        } else {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.UNEXPECTED_ERROR);
        }
    });
}

// Start a PCAP capture
router.put('/pcap/capture',
    // generate pcap information
    (req, res, next) => {
        // sets req.pcap, which is used by the ingest system
        req.pcap = generateRandomPcapDefinition(req);
        req.pcap.from_network = true; // sets this pcap as generated from network
        fs.createIfNotExists(req.pcap.folder);
        next();
    },
    // do the capture
    runTcpdump,
    // do the ingest
    ...pcapIngest
);

// get all "live" streams, active or not
router.get('/streams', (req, res) => {
    LiveStream.find().exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// get a single stream definition
router.get('/streams/:streamID/', (req, res) => {
    const { streamID } = req.params;

    LiveStream.findOne({ id: streamID }).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// delete a live stream
router.delete('/streams/:streamID/', (req, res) => {
    const { streamID } = req.params;

    LiveStream.deleteOne({ id: streamID }).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Patch the stream info with a new name */
router.patch('/streams/:streamID/', (req, res) => {
    const { streamID } = req.params;
    const alias = req.body.name;

    // todo: maybe check if it found a document (check data.n)?
    LiveStream.updateOne({ id: streamID }, { alias: alias }).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// subscribe to a stream on the network
router.put('/streams/subscribe', (req, res) => {
    // todo: ask probe to subscribe to this flow
    // either by sending a SDP file (through /senders information) or an endpoint (address + port)

    logger('live').info("Mocked...");
    logger('live').info(`Should subscribe: ${req.data}`);

    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
});

module.exports = router;
