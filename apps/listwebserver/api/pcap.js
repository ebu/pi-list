const router = require('express').Router();
const multer = require('multer');
const program = require('../util/programArguments');
const influxDbManager = require('../managers/influx-db');
const fs = require('../util/filesystem');
const logger = require('../util/logger');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const CONSTANTS = require('../enums/constants');
const Pcap = require('../models/pcap');
const Stream = require('../models/stream');
const { pcapSingleStreamIngest, pcapIngest,
    generateRandomPcapDefinition, generateRandomPcapFilename, getUserFolder } = require('../util/ingest');

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        req.pcap = generateRandomPcapDefinition(req);
        fs.createIfNotExists(req.pcap.folder);
        cb(null, req.pcap.folder);
    },
    filename: function (req, file, cb) {
        cb(null, generateRandomPcapFilename())
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
router.put('/', upload.single('pcap'), (req, res, next) => {
    res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send();
    next();
}, pcapIngest);

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

/* Download a PCAP File */
router.get('/:pcapID/download', (req, res) => {
    const { pcapID } = req.params;

    Pcap.findOne({id: pcapID}).exec()
        .then(data => {
            const path = `${getUserFolder(req)}/${pcapID}/${data.pcap_file_name}`;
            fs.downloadFile(path, `${data.file_name}.pcap`, res);
        });
});

/* Get sdp.sdp file for a pcap */
router.get('/:pcapID/sdp', (req, res) => {
    const { pcapID } = req.params;
    const path = `${getUserFolder(req)}/${pcapID}/sdp.sdp`;

    fs.downloadFile(path, `${pcapID}_sdp.sdp`, res);
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

router.get('/:pcapID/stream/:streamID/analytics/CInst/validation', (req, res) => {
    const { pcapID, streamID } = req.params;

    const path = `${getUserFolder(req)}/${pcapID}/${streamID}/${CONSTANTS.CINST_FILE}`;
    fs.sendFileAsResponse(path, res);
});

/* Audio Delays */
router.get('/:pcapID/stream/:streamID/analytics/AudioTransitDelay', (req, res) => {
    const { pcapID, streamID } = req.params;
    const { from, to } = req.query;

    chartData = influxDbManager.getAudioTransitDelay(pcapID, streamID, from, to);
    chartData
        .then(data => { res.json(data); })
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
});

router.get('/:pcapID/stream/:streamID/analytics/AudioTimeStampedDelayFactor', (req, res) => {
    const { pcapID, streamID } = req.params;
    const { from, to, tolerance, tsdfmax } = req.query;
    const limit = tolerance * 17; // EBU recommendation #3337

    chartData = influxDbManager.getAudioTimeStampedDelayFactor(pcapID, streamID, from, to);
    chartData
        .then(data => {
            data.forEach(e => {
                e['tolerance'] = tolerance;
                // display the red limit only when relevant
                if (tsdfmax > 0.3 * limit) e['limit'] = limit;
            });
            res.json(data);
        })
        .catch(() => res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(API_ERRORS.RESOURCE_NOT_FOUND));
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
    } else if (measurement === 'VrxIdealRaw') {
        chartData = influxDbManager.getVrxIdealRaw(pcapID, streamID, from, to);
    } else if (measurement === 'VrxAdjustedAvgTro') {
        chartData = influxDbManager.getVrxAdjustedAvgTro(pcapID, streamID, from, to);
    } else if (measurement === 'DeltaToIdealTpr0Raw') {
        chartData = influxDbManager.getDeltaToIdealTpr0Raw(pcapID, streamID, from, to)
    } else if (measurement === 'DeltaToIdealTpr0AdjustedAvgTroRaw') {
        chartData = influxDbManager.getDeltaToIdealTpr0AdjustedAvgTroRaw(pcapID, streamID, from, to)
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
router.put('/:pcapID/stream/:streamID/help', (req, res, next) => {
    const { pcapID, streamID } = req.params;

    Stream.findOneAndUpdate({id: streamID}, req.body, {new: true, overwrite: true}).exec()
        .then(() => {
            return Pcap.findOne({id: pcapID}).exec();
        })
        .then(pcap => {
            const pcap_folder = `${getUserFolder(req)}/${pcapID}`;
            const pcap_location = `${pcap_folder}/${pcap.pcap_file_name}`;

            // sets req.file, which is used by the ingest system
            req.file = {
                path: pcap_location,
                originalname: pcap.file_name,
                filename: pcap.pcap_file_name
            };

            // sets req.pcap, which is used by the ingest system
            req.pcap = {
                uuid: pcapID,
                folder: pcap_folder
            };

            next();
        })
        .catch((output) => {
            logger('Stream Re-ingest').error(`${output.stdout} ${output.stderr}`);
            res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR)
                .send(API_ERRORS.PCAP_EXTRACT_METADATA_ERROR);
        });
}, pcapSingleStreamIngest, (req, res) => {
    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
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
