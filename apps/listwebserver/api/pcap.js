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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userFolder = getRootPath(req);
        fs.createIfNotExists(userFolder);
        cb(null, userFolder);
    }
});

const upload = multer({ storage: storage });

function getRootPath(req) {
    return `${program.folder}/${req.session.passport.user.id}`;
}

/**
 *  PCAP file upload
 *  URL: /api/pcap/
 *  Method: PUT
 */
router.put('/', upload.single('pcap'), (req, res) => {
    const userID = req.session.passport.user.id;

    if(!req.file) {
        logger('pcap-api').error('File not received!');
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.PCAP_FILE_TO_UPLOAD_NOT_FOUND);
    } else {
        const pcap_uuid = uuidv1();
        const pcap_folder = `${getRootPath(req)}/${pcap_uuid}/`;
        const pcap_meta_file = `${getRootPath(req)}/${pcap_uuid}/${CONSTANTS.META_FILE}`;

        const streamPreProcessorCommand =
            `"${program.cpp}/stream_pre_processor" "${req.file.path}" "${getRootPath(req)}" ${pcap_uuid}`;

        const st2110ExtractorCommand =
            `"${program.cpp}/st2110_extractor" "${req.file.path}" "${pcap_folder}" ${program.influxURL}`;


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

                fs.readFile(pcap_meta_file)
                    .then(data => {
                        return Object.assign({}, data, {
                            file_name: req.file.originalname,
                            pcap_file_name: req.file.filename
                        })
                    })
                    .then(data => {
                        fs.writeFile(pcap_meta_file, data);
                        return data;
                    })
                    .then(data => {
                        websocketManager.instance().sendEventToUser(userID, {
                            event: "PCAP_FILE_PROCESSED",
                            data: Object.assign({}, data, { progress: 66 })
                        });
                    });
            })
            .then(() =>  {
                logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);
                websocketManager.instance().sendEventToUser(userID, {
                    event: 'ANALYZING',
                    data: {
                        id: pcap_uuid,
                        progress: 99
                    }
                });
                return exec(st2110ExtractorCommand);
            })
            .then((output) => {
                logger('st2110_extractor').info(output.stdout);
                fs.readFile(pcap_meta_file)
                    .then(data => {
                        websocketManager.instance().sendEventToUser(userID, {
                            event: "DONE",
                            data: Object.assign({}, data, { progress: 100 })
                        });
                    });
            })
            .catch((output) => {
                logger('upload-pcap').error(`exception: ${output} ${output.stderr}`);
            });
    }
});

router.delete('/:pcapID/', (req, res) => {
    const { pcapID } = req.params;
    const root = getRootPath(req);
    const path = `${root}/${pcapID}`;

    if(fs.folderExists(path)) {
        const pcap_meta_file = `${path}/${CONSTANTS.META_FILE}`;
        fs.readFile(pcap_meta_file)
            .then(data => {
                fs.delete(`${root}/${data.pcap_file_name}`); //delete the pcap itself
                fs.delete(path); // delete the whole pcap folder
                res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
            });
    } else {
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
    }
});

/* Get all Pcaps found */
router.get('/', (req, res) => {
    fs.readAllJSONFilesFromDirectory(getRootPath(req))
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));

});

/* GET _help.json files for all streams of a pcap */
router.get('/:pcapID/help/', (req, res) => {
    const { pcapID } = req.params;

    fs.readAllJSONFilesFromDirectory(`${getRootPath(req)}/${pcapID}`, CONSTANTS.HELP_FILE)
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

/* Get sdp.sdp file for a pcap */
router.get('/:pcapID/sdp', (req, res) => {
    const { pcapID } = req.params;
    const path = `${getRootPath(req)}/${pcapID}/sdp.sdp`;

    fs.sendFileAsResponse(path, res);
});


/* Get _meta.json from :pcap folder */
router.get('/:pcapID/', (req, res) => {

    const { pcapID } = req.params;

    const path = `${getRootPath(req)}/${pcapID}/${CONSTANTS.META_FILE}`;

    fs.sendFileAsResponse(path, res);
});

/* Get all streams from :pcap folder (_help and _meta merged) */
router.get('/:pcapID/streams/', (req, res) => {
    const { pcapID } = req.params;
    const pcapFolder = `${getRootPath(req)}/${pcapID}`;

    if(fs.folderExists(pcapFolder)) {
        const streams = fs.getAllFirstLevelFolders(pcapFolder)
            .map(stream => {
                const meta_path =`${pcapFolder}/${stream.id}/${CONSTANTS.META_FILE}`;
                const help = fs.readFile(`${pcapFolder}/${stream.id}/${CONSTANTS.HELP_FILE}`);
                let promises = [help];
                fs.fileExists(meta_path) ? promises.push(fs.readFile(meta_path)) : promises.push(Promise.resolve({}));

                return Promise.all(promises)
                    .then(([help, meta]) => {
                        return Promise.resolve(Object.assign({}, help, meta));
                    });
            });

        Promise.all(streams)
            .then(streamData => res.send(streamData));
    } else {
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND);
    }
});

router.get('/:pcapID/analytics/PtpOffset', (req, res) => {
    const { pcapID } = req.params;

    let chartData = influxDbManager.getPtpOffsetSamplesByPcap(pcapID)

    chartData.then(data => res.json(data));
});

/*** STREAM ***/

/* Get _meta.json file for stream */
router.get('/:pcapID/stream/:streamID', (req, res) => {
    const { pcapID, streamID } = req.params;

    const path = `${getRootPath(req)}/${pcapID}/${streamID}/${CONSTANTS.META_FILE}`;

    fs.sendFileAsResponse(path, res);
});

/* Get _help.json file for stream */
router.get('/:pcapID/stream/:streamID/help', (req, res) => {
    const { pcapID, streamID } = req.params;

    const path = `${getRootPath(req)}/${pcapID}/${streamID}/${CONSTANTS.HELP_FILE}`;

    fs.sendFileAsResponse(path, res);
});

/* */
router.get('/:pcapID/stream/:streamID/analytics/CInst/validation', (req, res) => {
    const { pcapID, streamID } = req.params;

    const path = `${getRootPath(req)}/${pcapID}/${streamID}/${CONSTANTS.CINST_FILE}`;

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
    } else if (measurement === 'VrxFirstPacketFirstFrame' ) {
        chartData = influxDbManager.getVrxFirstPacketFirstFrame(pcapID, streamID, from, to)
    } else if (measurement === 'VrxFirstPacketEachFrame' ) {
        chartData = influxDbManager.getVrxFirstPacketEachFrame(pcapID, streamID, from, to)
    } else if (measurement === 'VrxFirstPacketEachFrameRaw' ) {
        chartData = influxDbManager.getVrxFirstPacketEachFrameRaw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaToIdealTpr0Raw' ) {
        chartData = influxDbManager.getDeltaToIdealTpr0Raw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaRtpTsVsPacketTsRaw' ) {
        chartData = influxDbManager.getDeltaRtpTsVsPacketTsRaw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaToPreviousRtpTsRaw' ) {
        chartData = influxDbManager.getDeltaToPreviousRtpTsRaw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaRtpVsNt' ) {
        chartData = influxDbManager.getDeltaRtpVsNt(pcapID, streamID, from, to)
    }
    
    chartData.then(data => res.json(data));
});

/* PUT _help.json file for stream */
router.put('/:pcapID/stream/:streamID/help', (req, res) => {
    const { pcapID, streamID } = req.params;

    fs.writeFile(`${getRootPath(req)}/${pcapID}/${streamID}/${CONSTANTS.HELP_FILE}`, req.body)
        .then(() => fs.readFile(`${getRootPath(req)}/${pcapID}/${CONSTANTS.META_FILE}`))
        .then((meta) =>  {
            const pcap_file = `${getRootPath(req)}/${meta.pcap_file_name}`;
            const pcap_folder = `${getRootPath(req)}/${pcapID}/`;

            const st2110ExtractorCommand =
                `"${program.cpp}/st2110_extractor" "${pcap_file}" "${pcap_folder}" ${program.influxURL} -s "${streamID}"`;

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

    if( fs.folderExists(`${getRootPath(req)}/${pcapID}`) ) {
        const path = `${getRootPath(req)}/${pcapID}/${streamID}`;

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
    const packetsFilePath = `${getRootPath(req)}/${pcapID}/${streamID}/${frameID}/packets.json`;

    fs.sendFileAsResponse(packetsFilePath, res);
});

/* Get png file for a frame */
router.get('/:pcapID/stream/:streamID/frame/:frameID/png', (req, res) => {
    const { pcapID, streamID, frameID } = req.params;
    const pngFilePath = `${getRootPath(req)}/${pcapID}/${streamID}/${frameID}/frame.png`;

    fs.sendFileAsResponse(pngFilePath, res);
});

/*** Audio ***/
/* Get mp3 file for an audio stream */
router.get('/:pcapID/stream/:streamID/mp3', (req, res) => {
    const { pcapID, streamID } = req.params;
    const filePath = `${getRootPath(req)}/${pcapID}/${streamID}/audio.mp3`;

    fs.sendFileAsResponse(filePath, res);
});


module.exports = router;
