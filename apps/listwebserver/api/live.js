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
const path = require('path');
const os = require('os');

const { pcapIngest, generateRandomPcapDefinition, generateRandomPcapFilename } = require('../util/ingest');


function runTcpdump(req, res, next) {
    logger('live').info(`Received: ${JSON.stringify(req.body)}`);

    const new_pcap_filename = generateRandomPcapFilename();
    const tempFile = path.join(os.tmpdir(), new_pcap_filename);
    const destinationFile = `${req.pcap.folder}/${new_pcap_filename}`;
    const duration_ms = req.body.duration || 500;

    // sets req.file, which is used by the ingest system
    req.file = {
        path: destinationFile,
        originalname: req.body.name,
        filename: new_pcap_filename
    };

    if (!program.capture || !program.capture.interfaceName) {
        throw new Error('program.capture.interfaceName not set in configuration file');
    }

    const snapshotLength = program.capture.snapshotLength
        ? [`--snapshot-length=${program.capture.snapshotLength}`]
        : [];

    // tcpdump filter must be like "dst XXX.XXX.XXX.XXX or dst YYY.YYY.YYY.YYY or ..."
    const tcpdumpFilter = req.body.stream ?
        `${
            req.body.stream.map(stream => {
                return stream.dstAddr? "dst " + stream.dstAddr : '';
            })
        }`.replace(/,/g,' or ')
        : '';

    const tcpdumpProgram = '/usr/sbin/tcpdump';
    const tcpdumpOptions = {};

    const tcpdumpArguments = [
        "-i", program.capture.interfaceName,
        "--time-stamp-precision=nano",
        "-j", "adapter_unsynced",
        "-c", "5000000",
        ...snapshotLength,
        "-w", tempFile,
        tcpdumpFilter
    ];

    console.log(`${tcpdumpProgram} ${tcpdumpArguments.join(' ')}`);

    const tcpDumpProcess = child_process.spawn(tcpdumpProgram,
        tcpdumpArguments,
        tcpdumpOptions
    );

    const tcpdumpOutput = [];
    const appendToOutput = (data) => {
        tcpdumpOutput.push(new TextDecoder("utf-8").decode(data));
    };

    tcpDumpProcess.on('error', (err) => {
        logger('live').error(`error during capture:, ${err}`);
    });

    tcpDumpProcess.stdout.on('data', appendToOutput);
    tcpDumpProcess.stderr.on('data', appendToOutput);

    const getDropInfo = (stdout) => {
        const kernel_regex = /(\d+) *packets dropped by kernel/m;
        const kernel_found = stdout.match(kernel_regex);
        const kernel = kernel_found ? parseInt(kernel_found[1]) : 0;

        const interface_regex = /(\d+) *packets dropped by interface/m;
        const interface_found = stdout.match(interface_regex);
        const interface = interface_found ? parseInt(interface_found[1]) : 0;

        return { kernel, interface };
    };

    tcpDumpProcess.on('close', (code) => {
        logger('live').info(`child process exited with code ${code}`);

        const stdout = tcpdumpOutput.join('\n');

        const dropInfo = getDropInfo(stdout);

        logger('live').info('Drop info:', dropInfo);
        logger('live').info(stdout);

        clearTimeout(timer);

        if (dropInfo.kernel > 0 || dropInfo.interface > 0) {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.UNEXPECTED_ERROR);
            jetpack.removeAsync(tempFile);
            return;
        }

        jetpack.copyAsync(tempFile, destinationFile)
        .then(() =>{
            jetpack.removeAsync(tempFile);
            if (code === 0 || killed) {
                res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send();
                next();
            } else {
                res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.UNEXPECTED_ERROR);
            }
        })
        .catch(() => {
            logger('live').error('Could not copy pcap file');
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.UNEXPECTED_ERROR);
        });
    });

    // subscribe
    const subscribeToProgram = `${program.cpp}/subscribe_to`;
    const subscribeToOptions = {};
    const addressSubscription = [];
    req.body.stream.forEach(s => {
        addressSubscription.push('-g', s.dstAddr);
    });

    const subscribeToArguments = [
        program.capture.interfaceName,
        ...addressSubscription
    ];

    logger('live').info(`${subscribeToProgram} ${subscribeToArguments.join(' ')}`);

    const subscribeToProcess = child_process.spawn(subscribeToProgram,
        subscribeToArguments,
        subscribeToOptions
    );

    subscribeToProcess.on('error', (err) => {
        logger('live').error(`error during subscription:, ${err}`);
    });

    subscribeToProcess.on('close', (code) => {
        logger('live').info(`subscribeTo process exited with code ${code}`);
    });

    let killed = false;
    const onTimeout = () => {
        console.log('onTimeout');
        killed = true;
        tcpDumpProcess.kill();
        subscribeToProcess.kill();
    };

    const timer = setTimeout(onTimeout, duration_ms);
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
