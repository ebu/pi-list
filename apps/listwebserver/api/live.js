const router = require('express').Router();
const logger = require('../util/logger');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const API_ERRORS = require('../enums/apiErrors');
const LiveStream = require('../models/liveStream');
const fs = require('../util/filesystem');
const { performCapture } = require('../controllers/capture');
const { pcapIngest, generateRandomPcapDefinition } = require('../util/ingest');
const liveSources = require('../controllers/live/sources');

// Start a PCAP capture
router.put('/pcap/capture',
    // generate pcap information
    (req, res, next) => {
        // sets req.pcap, which is used by the ingest system
        req.pcap = generateRandomPcapDefinition(req, req.body.capture_id);

        req.pcap.from_network = true; // sets this pcap as generated from network
        fs.createIfNotExists(req.pcap.folder);
        next();
    },
    // do the capture
    performCapture,
    // do the ingest
    ...pcapIngest
);

// get all live streams, active or not
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


// get all live sources
router.get('/sources', (req, res) => {
    liveSources.getLiveSources()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(API_ERRORS.UNEXPECTED_ERROR));
});

// add a live sources. body : { source: <source to add> }
router.post('/sources', (req, res) => {
    liveSources.addLiveSource(req.body.source)
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(API_ERRORS.UNEXPECTED_ERROR));
});


// delete live sources
router.put('/sources/delete', (req, res) => {
    const { ids } = req.body;
    if (ids === null || ids === undefined) {
        res.status(HTTP_STATUS_CODE.SERVER_ERROR.BAD_REQUEST).send(API_ERRORS.RESOURCE_NOT_FOUND);
        return;
    };

    liveSources.deleteLiveSources(ids)
        .then(data => {
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data);
        })
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(API_ERRORS.UNEXPECTED_ERROR));
});

module.exports = router;
