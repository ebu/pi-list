const router = require('express').Router();
const logger = require('../util/logger');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const API_ERRORS = require('../enums/apiErrors');
const LiveStream = require('../models/liveStream');

// get all "live" streams, active or not
router.get('/streams', (req, res) => {
    LiveStream.find().exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// get a single stream definition
router.get('/streams/:streamID/', (req, res) => {
    const { streamID } = req.params;

    LiveStream.findOne({id: streamID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// delete a live stream
router.delete('/streams/:streamID/', (req, res) => {
    const { streamID } = req.params;

    LiveStream.deleteOne({id: streamID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Patch the stream info with a new name */
router.patch('/streams/:streamID/', (req, res) => {
    const { streamID } = req.params;
    const alias = req.body.name;

    // todo: maybe check if it found a document (check data.n)?
    LiveStream.updateOne({id: streamID}, {alias: alias}).exec()
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
