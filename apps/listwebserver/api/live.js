const router = require('express').Router();
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const API_ERRORS = require('../enums/apiErrors');
const LiveStream = require('../models/liveStream');

// todo: stream ownership

// get all "live" streams, active or not
router.get('/streams', (req, res) => {
    const userID = req.session.passport.user.id;

    LiveStream.find(/*{owner_id: userID}*/).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

// get a single stream definition
router.get('/streams/:streamID/', (req, res) => {
    const { streamID } = req.params;
    // const userID = req.session.passport.user.id;

    LiveStream.findOne({/*owner_id: userID, */id: streamID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

module.exports = router;
