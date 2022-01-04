const router = require('express').Router();
import logger from '../util/logger';
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const API_ERRORS = require('../enums/apiErrors');
const LiveStream = require('../models/liveStream');
const liveSources = require('../controllers/live/sources');
const {
    getUserId,
    checkIsReadOnly
} = require('../auth/middleware');
const websocketManager = require('../managers/websocket');
import {
    api
} from '@bisect/ebu-list-sdk';

// get all live streams, active or not
router.get('/streams', (req, res) => {
    LiveStream.find()
        .exec()
        .then((data) => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// get a single stream definition
router.get('/streams/:streamID/', (req, res) => {
    const {
        streamID
    } = req.params;

    LiveStream.findOne({
            id: streamID
        })
        .exec()
        .then((data) => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// delete a live stream
router.delete('/streams/:streamID/', checkIsReadOnly, (req, res) => {
    const {
        streamID
    } = req.params;

    LiveStream.deleteOne({
            id: streamID
        })
        .exec()
        .then((data) => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Patch the stream info with a new name */
router.patch('/streams/:streamID/', checkIsReadOnly, (req, res) => {
    const {
        streamID
    } = req.params;
    const alias = req.body.name;

    // todo: maybe check if it found a document (check data.n)?
    LiveStream.updateOne({
            id: streamID
        }, {
            alias: alias
        })
        .exec()
        .then((data) => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// subscribe to a stream on the network
router.put('/streams/subscribe', checkIsReadOnly, (req, res) => {
    // todo: ask probe to subscribe to this flow
    // either by sending a SDP file (through /senders information) or an endpoint (address + port)

    logger('live').info('Mocked...');
    logger('live').info(`Should subscribe: ${req.data}`);

    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
});

// get all live sources
router.get('/sources', (req, res) => {
    liveSources
        .getAllLiveSources()
        .then((data) => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(API_ERRORS.UNEXPECTED_ERROR));
});

// add a live source. body : { source: <source to add> }
router.post('/sources', checkIsReadOnly, (req, res) => {
    const userId = getUserId(req);
    liveSources
        .addLiveSource(req.body)
        .then((data) => {
            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.LiveSource.list_update,
                data: data,
            });
            res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send(data)
        })
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(API_ERRORS.UNEXPECTED_ERROR));
});

// update a live source. body : { source: <source to update> }
router.put('/sources/:sourceID', checkIsReadOnly, (req, res) => {
    const userId = getUserId(req);
    liveSources
        .updateLiveSource(req.body)
        .then((data) => {
            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.LiveSource.list_update,
                data: data,
            });
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data)
        })
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(API_ERRORS.UNEXPECTED_ERROR));
});

// delete live source
router.delete('/sources/:sourceID', checkIsReadOnly, (req, res) => {
    const {
        sourceID
    } = req.params;
    const userId = getUserId(req);
    if (sourceID === null || sourceID === undefined) {
        res.status(HTTP_STATUS_CODE.SERVER_ERROR.BAD_REQUEST).send(API_ERRORS.RESOURCE_NOT_FOUND);
        return;
    }

    liveSources
        .deleteLiveSource(sourceID)
        .then((data) => {
            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.LiveSource.list_update,
                data: data,
            });
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data);
        })
        .catch(() => res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(API_ERRORS.UNEXPECTED_ERROR));
});

module.exports = router;