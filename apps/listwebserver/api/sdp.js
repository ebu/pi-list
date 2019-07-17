const os = require('os');
const uuidv1 = require('uuid/v1');
const { isObject, isEmpty } = require('lodash');
const { Router } = require('express');
const router = Router();
const multer = require('multer');
const fs = require('../util/filesystem');
const program = require('../util/programArguments');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const { sdpIngest } = require('../util/ingest');
const { sdpFileToSource } = require('../controllers/sdp');

// Constants
const availableOptionsFile = `${program.folder}/stream_types.json`;

router.get('/available-options', (req, res) => {
    const { query } = req;

    if (isObject(query) && !isEmpty(query)) {
        if (
            query.media_type === 'video' ||
            query.media_type === 'audio' ||
            query.media_type === 'ancillary'
        ) {
            fs.readFile(`${program.folder}/${query.media_type}_options.json`)
                .then(data =>
                    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data)
                )
                .catch(() =>
                    res
                        .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                        .send(API_ERRORS.SDP_VIDEO_OPTIONS_NOT_FOUND)
                );
        } else {
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(
                API_ERRORS.SDP_INVALID_MEDIA_TYPE_VALUE
            );
        }
    } else {
        fs.readFile(availableOptionsFile)
            .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
            .catch(() =>
                res
                    .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                    .send(API_ERRORS.SDP_AVAILABLE_OPTIONS_NOT_FOUND)
            );
    }
});

const storageTmp = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, os.tmpdir());
    },
    filename: function(req, file, cb) {
        cb(null, uuidv1());
    },
});

const upload = multer({ storage: storageTmp });

// save the doc in a tmp file, check it, parse it and delete it.
router.put(
    '/',
    upload.single('sdp'),
    (req, res, next) => {
        res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send();
        next();
    },
    sdpIngest
);

// parse the SDP and return it as a sender
router.put('/to_source', upload.single('sdp'), (req, res, next) => {
    sdpFileToSource(req.file.path)
        .then(source =>
            res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send({
                result: 'success',
                source,
            })
        )
        .catch(err =>
            res
                .status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR)
                .send(err)
        );
});

module.exports = router;
