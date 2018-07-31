const util = require('util');
const child_process = require('child_process');
const router = require('express').Router();
const multer = require('multer');
const uuidv1 = require('uuid/v1');
const program = require('../util/programArguments');
const websocketManager = require('../managers/websocket');
const influxDbManager = require('../managers/influx-db');
const fs = require('../util/filesystem');
const logger = require('../util/logger');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const CONSTANTS = require('../enums/constants');
const exec = util.promisify(child_process.exec);
const Pcap = require('../models/pcap');
const Stream = require('../models/stream');

function isAuthorized (req, res, next) {
    const { pcapID } = req.params;

    if (pcapID) {
        const userID = req.session.passport.user.id;

        Pcap.findOne({owner_id: userID, id: pcapID}).exec()
            .then((data) => {
                if (data) next();
                else res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
            })
            .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
    } else next();
}

function argumentsToCmd() {
    return {
        withMongo: `-mongo_url ${program.databaseURL}`,
        withInflux: `-influx_url ${program.influxURL}`
    };
}

function getUserFolder(req) {
    return `${program.folder}/${req.session.passport.user.id}`;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const pcap_uuid = uuidv1();
        // generate pcap info and save in the req for using in the handling
        req.pcap = {
            uuid: pcap_uuid,
            folder: `${getUserFolder(req)}/${pcap_uuid}`
        };
        fs.createIfNotExists(req.pcap.folder);
        cb(null, req.pcap.folder);
    }
});

const upload = multer({ storage: storage });

// Check if the user can access the pcap
router.use('/:pcapID', isAuthorized);

/**
 *  PCAP file upload
 *  URL: /api/pcap/
 *  Method: PUT
 */
router.put('/', upload.single('pcap'), (req, res) => {
    const userID = req.session.passport.user.id;

    if (!req.file) {
        logger('pcap-api').error('File not received!');
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.PCAP_FILE_TO_UPLOAD_NOT_FOUND);
    } else {
        const pcap_uuid = req.pcap.uuid;
        const pcap_folder = req.pcap.folder;

        const {withMongo, withInflux} = argumentsToCmd();

        const streamPreProcessorCommand = `"${program.cpp}/stream_pre_processor" "${req.file.path}" ${pcap_uuid} ${withMongo}`;
        const st2110ExtractorCommand =
            `"${program.cpp}/st2110_extractor" ${pcap_uuid} "${req.file.path}" "${pcap_folder}" ${withInflux} ${withMongo}`;

        websocketManager.instance().sendEventToUser(userID, {
            event: 'PCAP_FILE_RECEIVED',
            data: {
                id: pcap_uuid,
                file_name: req.file.originalname,
                pcap_file_name: req.file.filename,
                date: Date.now(),
                progress: 33
            }
        });
        res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send();

        logger('stream-pre-processor').info(`Command: ${streamPreProcessorCommand}`);
        exec(streamPreProcessorCommand)
            .then((output) => {
                logger('stream-pre-process').info(output.stdout);

                return Pcap.findOneAndUpdate({id: pcap_uuid},
                    {file_name: req.file.originalname, pcap_file_name: req.file.filename, owner_id: userID}, {new: true}).exec();
            })
            .then((data) => {
                websocketManager.instance().sendEventToUser(userID, {
                    event: "PCAP_FILE_PROCESSED",
                    data: Object.assign({}, data._doc, { progress: 66 })
                });

                logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);
                return exec(st2110ExtractorCommand);
            })
            .then((output) => {
                logger('st2110_extractor').info(output.stdout);
                Pcap.findOne({id: pcap_uuid}).exec()
                    .then(data => {
                        websocketManager.instance().sendEventToUser(userID, {
                            event: "DONE",
                            data: Object.assign({}, data._doc, { progress: 100 })
                        });
                    });
            })
            .catch((output) => {
                logger('upload-pcap').error(`exception: ${output} ${output.stderr}`);
                //todo: delete pcap!!!
            });
    }
});

/* Get all Pcaps found */
router.get('/', (req, res) => {
    const userID = req.session.passport.user.id;
    Pcap.find({owner_id: userID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Delete a PCAP */
router.delete('/:pcapID/', (req, res) => {
    const { pcapID } = req.params;
    const path = `${getUserFolder(req)}/${pcapID}`;

    Pcap.deleteOne({id: pcapID}).exec()
        .then(() => {
            return fs.delete(path); // delete the whole pcap folder
        })
        .then(() => {
            return Stream.deleteMany({pcap: pcapID}).exec(); // delete the associated streams
        })
        .then(() => {
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
        })
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});


/* Get sdp.sdp file for a pcap */
router.get('/:pcapID/sdp', (req, res) => {
    const { pcapID } = req.params;
    const path = `${getUserFolder(req)}/${pcapID}/sdp.sdp`;

    fs.sendFileAsResponse(path, res);
});

/* Get info from pcap */
router.get('/:pcapID/', (req, res) => {
    const { pcapID } = req.params;

    Pcap.findOne({id: pcapID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

router.get('/:pcapID/analytics/PtpOffset', (req, res) => {
    const { pcapID } = req.params;

    const chartData = influxDbManager.getPtpOffsetSamplesByPcap(pcapID);
    chartData
        .then(data => res.json(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Get all streams from a pcap */
router.get('/:pcapID/streams/', (req, res) => {
    const { pcapID } = req.params;

    Stream.find({pcap: pcapID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/*** STREAM ***/

/* Get _meta.json file for stream */
router.get('/:pcapID/stream/:streamID', (req, res) => {
    const { streamID } = req.params;

    Stream.findOne({id: streamID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Get _help.json file for stream */
router.get('/:pcapID/stream/:streamID/help', (req, res) => {
    const { streamID } = req.params;

    Stream.findOne({id: streamID}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Patch the stream info with a new name */
router.patch('/:pcapID/stream/:streamID', (req, res) => {
    const { streamID } = req.params;
    const alias = req.body.name;

    // todo: maybe check if it found a document (check data.n)?
    Stream.updateOne({id: streamID}, {alias: alias}).exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* */
router.get('/:pcapID/stream/:streamID/analytics/CInst/validation', (req, res) => {
    const { pcapID, streamID } = req.params;

    const path = `${getUserFolder(req)}/${pcapID}/${streamID}/${CONSTANTS.CINST_FILE}`;
    fs.sendFileAsResponse(path, res);
});

/* */
router.get('/:pcapID/stream/:streamID/analytics/:measurement', (req, res) => {
    const { pcapID, streamID, measurement } = req.params;
    const { from, to } = req.query;

    let chartData = null;

    if (measurement === 'CInst') {
        chartData = influxDbManager.getCInstByStream(pcapID, streamID, from, to);
    } else if (measurement === 'CInstRaw') {
        chartData = influxDbManager.getCInstRaw(pcapID, streamID, from, to);
    } else if (measurement === 'VrxIdeal') {
        chartData = influxDbManager.getVrxIdeal(pcapID, streamID, from, to);
    } else if (measurement === 'VrxFirstPacketFirstFrame') {
        chartData = influxDbManager.getVrxFirstPacketFirstFrame(pcapID, streamID, from, to)
    } else if (measurement === 'VrxFirstPacketEachFrame') {
        chartData = influxDbManager.getVrxFirstPacketEachFrame(pcapID, streamID, from, to)
    } else if (measurement === 'VrxFirstPacketEachFrameRaw') {
        chartData = influxDbManager.getVrxFirstPacketEachFrameRaw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaToIdealTpr0Raw') {
        chartData = influxDbManager.getDeltaToIdealTpr0Raw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaRtpTsVsPacketTsRaw') {
        chartData = influxDbManager.getDeltaRtpTsVsPacketTsRaw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaToPreviousRtpTsRaw') {
        chartData = influxDbManager.getDeltaToPreviousRtpTsRaw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaRtpVsNt') {
        chartData = influxDbManager.getDeltaRtpVsNt(pcapID, streamID, from, to)
    }

    chartData.then(data => res.json(data));
});

/* PUT new help information for stream */
router.put('/:pcapID/stream/:streamID/help', (req, res) => {
    const { pcapID, streamID } = req.params;

    // todo: only change media_specific and media_type?
    // todo: do we really need overwrite?
    Stream.findOneAndUpdate({id: streamID}, req.body, {new: true, overwrite: true}).exec()
        .then(() => {
            return Pcap.findOne({id: pcapID}).exec();
        })
        .then(pcap => {
            const pcap_folder = `${getUserFolder(req)}/${pcapID}`;
            const pcap_location = `${pcap_folder}/${pcap.pcap_file_name}`;

            const {withMongo, withInflux} = argumentsToCmd();

            const st2110ExtractorCommand =
                `"${program.cpp}/st2110_extractor" ${pcapID} "${pcap_location}" "${pcap_folder}" ${withInflux} ${withMongo} -s "${streamID}"`;

            logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);
            return exec(st2110ExtractorCommand);
        })
        .then((output) => {
            logger('st2110_extractor').info(output.stdout);
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(true);
        })
        .catch((output) => {
            logger('st2110_extractor').error(`${output.stdout} ${output.stderr}`);
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR)
                .send(API_ERRORS.PCAP_EXTRACT_METADATA_ERROR);
        });
});

/* Get all frames for stream */
router.get('/:pcapID/stream/:streamID/frames', (req, res) => {
    const { pcapID, streamID } = req.params;

    if (fs.folderExists(`${getUserFolder(req)}/${pcapID}`)) {
        const path = `${getUserFolder(req)}/${pcapID}/${streamID}`;

        const frames = fs.getAllFirstLevelFolders(path)
            .map(frame => fs.readFile(`${path}/${frame.id}/${CONSTANTS.META_FILE}`));

        Promise.all(frames).then(data => res.send(data));
    } else {
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
    }
});

/*** FRAME ***/

/* Get packets.json file for a frame */
router.get('/:pcapID/stream/:streamID/frame/:frameID/packets', (req, res) => {
    const { pcapID, streamID, frameID } = req.params;
    const packetsFilePath = `${getUserFolder(req)}/${pcapID}/${streamID}/${frameID}/packets.json`;

    fs.sendFileAsResponse(packetsFilePath, res);
});

/* Get png file for a frame */
router.get('/:pcapID/stream/:streamID/frame/:frameID/png', (req, res) => {
    const { pcapID, streamID, frameID } = req.params;
    const pngFilePath = `${getUserFolder(req)}/${pcapID}/${streamID}/${frameID}/frame.png`;

    fs.sendFileAsResponse(pngFilePath, res);
});

/*** Audio ***/
/* Get mp3 file for an audio stream */
router.get('/:pcapID/stream/:streamID/mp3', (req, res) => {
    const { pcapID, streamID } = req.params;
    const filePath = `${getUserFolder(req)}/${pcapID}/${streamID}/audio.mp3`;

    fs.sendFileAsResponse(filePath, res);
});

module.exports = router;
