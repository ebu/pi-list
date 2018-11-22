const { isObject, isEmpty } = require('lodash');
const { Router } = require('express');
const router = Router();
const fs = require('../util/filesystem');
const program = require('../util/programArguments');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');

// Constants
const availableOptionsFile = `${program.folder}/stream_types.json`;

router.get('/available-options', (req, res) => {
    const { query } = req;

    if (isObject(query) && !isEmpty(query)) {
        if (query.media_type === "video" || query.media_type === "audio" || query.media_type === "ancillary" ) {
            fs.readFile(`${program.folder}/${query.media_type}_options.json`)
                .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
                .catch(() => res
                    .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                    .send(API_ERRORS.SDP_VIDEO_OPTIONS_NOT_FOUND));
        } else {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.SDP_INVALID_MEDIA_TYPE_VALUE);
        }
    } else {
        fs.readFile(availableOptionsFile)
            .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
            .catch(() => res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.SDP_AVAILABLE_OPTIONS_NOT_FOUND));
    }
});

module.exports = router;
