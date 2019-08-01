const child_process = require('child_process');
const router = require('express').Router();
const multer = require('multer');
const util = require('util');
const program = require('../util/programArguments');
const influxDbManager = require('../managers/influx-db');
const fs = require('../util/filesystem');
const logger = require('../util/logger');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const CONSTANTS = require('../enums/constants');
const Pcap = require('../models/pcap');
const pcapController = require('../controllers/pcap');
const Stream = require('../models/stream');
const streamsController = require('../controllers/streams');
const {
    pcapSingleStreamIngest,
    pcapIngest,
    generateRandomPcapDefinition,
    generateRandomPcapFilename,
    getUserFolder,
} = require('../util/ingest');
const websocketManager = require('../managers/websocket');
const WS_EVENTS = require('../enums/wsEvents');
const exec = util.promisify(child_process.exec);

function isAuthorized(req, res, next) {
    const { pcapID } = req.params;

    if (pcapID) {
        const userID = req.session.passport.user.id;

        Pcap.findOne({ owner_id: userID, id: pcapID })
            .exec()
            .then(data => {
                if (data) next();
                else
                    res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(
                        API_ERRORS.RESOURCE_NOT_FOUND
                    );
            })
            .catch(() =>
                res
                    .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                    .send(API_ERRORS.RESOURCE_NOT_FOUND)
            );
    } else next();
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        req.pcap = generateRandomPcapDefinition(req);
        fs.createIfNotExists(req.pcap.folder);
        cb(null, req.pcap.folder);
    },
    filename: function(req, file, cb) {
        cb(null, generateRandomPcapFilename());
    },
});

const upload = multer({ storage: storage });

// Check if the user can access the pcap
router.use('/:pcapID', isAuthorized);

/**
 *  PCAP file upload
 *  URL: /api/pcap/
 *  Method: PUT
 */
router.put(
    '/',
    upload.single('pcap', 'originalFilename'),
    (req, res, next) => {
        res.status(HTTP_STATUS_CODE.SUCCESS.CREATED).send();
        next();
    },
    pcapIngest
);

/* Get all Pcaps found */
router.get('/', (req, res) => {
    const userID = req.session.passport.user.id;
    Pcap.find({ owner_id: userID })
        .exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

/* Delete a PCAP */
router.delete('/:pcapID/', (req, res) => {
    const { pcapID } = req.params;
    const path = `${getUserFolder(req)}/${pcapID}`;

    Pcap.deleteOne({ id: pcapID })
        .exec()
        .then(() => {
            return fs.delete(path); // delete the whole pcap folder
        })
        .then(() => {
            return Stream.deleteMany({ pcap: pcapID }).exec(); // delete the associated streams
        })
        .then(() => {
            return influxDbManager.deleteSeries(pcapID); // delete the associated streams
        })
        .then(() => {
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
        })
        .then(() => {
            const userID = req.session.passport.user.id;
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_DELETED,
                data: { id: pcapID },
            });
        })
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

/* Get the report for a pcap */
router.get('/:pcapID/report', (req, res) => {
    const { pcapID } = req.params;
    pcapController
        .getReport(pcapID)
        .then(report => {
            res.setHeader(
                'Content-disposition',
                `attachment; filename=${pcapID}.json`
            );
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(report);
        })
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

/* Download a PCAP File */
router.get('/:pcapID/download', (req, res) => {
    const { pcapID } = req.params;

    Pcap.findOne({ id: pcapID })
        .exec()
        .then(data => {
            const path = `${getUserFolder(req)}/${pcapID}/${
                data.pcap_file_name
            }`;
            fs.downloadFile(path, `${data.file_name}.pcap`, res);
        });
});

/* Get sdp.sdp file for a pcap */
router.get('/:pcapID/sdp', (req, res) => {
    const { pcapID } = req.params;

    Pcap.findOne({ id: pcapID })
        .exec()
        .then(data => {
            const path = `${getUserFolder(req)}/${pcapID}/sdp.zip`;
            const fileName = data.file_name.replace(/\.[^\.]*$/, '') + '.zip';
            fs.downloadFile(path, fileName, res);
        });
});

/* Get info from pcap */
router.get('/:pcapID/', (req, res) => {
    const { pcapID } = req.params;

    Pcap.findOne({ id: pcapID })
        .exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

router.get('/:pcapID/analytics/PtpOffset', (req, res) => {
    const { pcapID } = req.params;

    const chartData = influxDbManager.getPtpOffsetSamplesByPcap(pcapID);
    chartData
        .then(data => res.json(data))
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

/* Get all streams from a pcap */
router.get('/:pcapID/streams/', (req, res) => {
    const { pcapID } = req.params;
    streamsController
        .getStreamsForPcap(pcapID)
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

/*** STREAM ***/

/* Get _meta.json file for stream */
router.get('/:pcapID/stream/:streamID', (req, res) => {
    const { streamID } = req.params;

    streamsController
        .getStreamWithId(streamID)
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

/* Get _help.json file for stream */
router.get('/:pcapID/stream/:streamID/help', (req, res) => {
    const { streamID } = req.params;

    streamsController
        .getStreamWithId(streamID)
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

/* Patch the stream info with a new name */
router.patch('/:pcapID/stream/:streamID', (req, res) => {
    const { streamID } = req.params;
    const alias = req.body.name;

    // todo: maybe check if it found a document (check data.n)?
    Stream.updateOne({ id: streamID }, { alias: alias })
        .exec()
        .then(data => res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data))
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
});

router.get(
    '/:pcapID/stream/:streamID/analytics/CInst/histogram',
    (req, res) => {
        const { pcapID, streamID } = req.params;

        const path = `${getUserFolder(req)}/${pcapID}/${streamID}/${
            CONSTANTS.CINST_FILE
        }`;
        fs.sendFileAsResponse(path, res);
    }
);

router.get('/:pcapID/stream/:streamID/analytics/Vrx/histogram', (req, res) => {
    const { pcapID, streamID } = req.params;

    const path = `${getUserFolder(req)}/${pcapID}/${streamID}/${
        CONSTANTS.VRX_FILE
    }`;
    fs.sendFileAsResponse(path, res);
});

/* Audio Delays */
router.get(
    '/:pcapID/stream/:streamID/analytics/AudioRtpTsVsPktTs',
    (req, res) => {
        const { pcapID, streamID } = req.params;
        const { from, to, min, max } = req.query;

        chartData = influxDbManager.getAudioRtpTsVsPktTs(
            pcapID,
            streamID,
            from,
            to
        );
        chartData
            .then(data => {
                res.json(data);
            })
            .catch(() =>
                res
                    .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                    .send(API_ERRORS.RESOURCE_NOT_FOUND)
            );
    }
);

router.get(
    '/:pcapID/stream/:streamID/analytics/AudioTimeStampedDelayFactor',
    (req, res) => {
        const { pcapID, streamID } = req.params;
        const { from, to, tolerance, tsdfmax } = req.query;
        const limit = tolerance * 17; // EBU recommendation #3337

        chartData = influxDbManager.getAudioTimeStampedDelayFactor(
            pcapID,
            streamID,
            from,
            to
        );
        chartData
            .then(data => {
                data.forEach(e => {
                    e['high-tolerance'] = tolerance;
                    // display the red limit only when relevant
                    if (tsdfmax > 0.3 * limit) e['high-limit'] = limit;
                });
                res.json(data);
            })
            .catch(() =>
                res
                    .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                    .send(API_ERRORS.RESOURCE_NOT_FOUND)
            );
    }
);

/* */
router.get('/:pcapID/stream/:streamID/analytics/:measurement', (req, res) => {
    const { pcapID, streamID, measurement } = req.params;
    const { from, to } = req.query;

    let chartData = null;

    if (measurement === 'CInst') {
        chartData = influxDbManager.getCInstByStream(
            pcapID,
            streamID,
            from,
            to
        );
    } else if (measurement === 'CInstRaw') {
        chartData = influxDbManager.getCInstRaw(pcapID, streamID, from, to);
    } else if (measurement === 'VrxIdeal') {
        chartData = influxDbManager.getVrxIdeal(pcapID, streamID, from, to);
    } else if (measurement === 'VrxIdealRaw') {
        chartData = influxDbManager.getVrxIdealRaw(pcapID, streamID, from, to);
    } else if (measurement === 'VrxAdjustedAvgTro') {
        chartData = influxDbManager.getVrxAdjustedAvgTro(
            pcapID,
            streamID,
            from,
            to
        );
    } else if (measurement === 'DeltaToIdealTpr0Raw') {
        chartData = influxDbManager.getDeltaToIdealTpr0Raw(
            pcapID,
            streamID,
            from,
            to
        );
    } else if (measurement === 'DeltaToIdealTpr0AdjustedAvgTroRaw') {
        chartData = influxDbManager.getDeltaToIdealTpr0AdjustedAvgTroRaw(
            pcapID,
            streamID,
            from,
            to
        );
    } else if (measurement === 'DeltaRtpTsVsPacketTsRaw') {
        chartData = influxDbManager.getDeltaRtpTsVsPacketTsRaw(
            pcapID,
            streamID,
            from,
            to
        );
    } else if (measurement === 'DeltaToPreviousRtpTsRaw') {
        chartData = influxDbManager.getDeltaToPreviousRtpTsRaw(
            pcapID,
            streamID,
            from,
            to
        );
    } else if (measurement === 'DeltaRtpVsNt') {
        chartData = influxDbManager.getDeltaRtpVsNt(pcapID, streamID, from, to);
    } else if (measurement === 'DeltaRtpVsNtTicksMinMax') {
        chartData = influxDbManager.getDeltaRtpVsNtTicksMinMax(
            pcapID,
            streamID
        );
    }
    chartData.then(data => res.json(data));
});

/* PUT new help information for stream */
router.put(
    '/:pcapID/stream/:streamID/help',
    (req, res, next) => {
        const { pcapID, streamID } = req.params;

        Stream.findOneAndUpdate({ id: streamID }, req.body, {
            new: true,
            overwrite: true,
        })
            .exec()
            .then(() => {
                return Pcap.findOne({ id: pcapID }).exec();
            })
            .then(pcap => {
                const pcap_folder = `${getUserFolder(req)}/${pcapID}`;
                const pcap_location = `${pcap_folder}/${pcap.pcap_file_name}`;

                // sets req.file, which is used by the ingest system
                req.file = {
                    path: pcap_location,
                    originalname: pcap.file_name,
                    filename: pcap.pcap_file_name,
                };

                // sets req.pcap, which is used by the ingest system
                req.pcap = {
                    uuid: pcapID,
                    folder: pcap_folder,
                };

                next();
            })
            .catch(output => {
                logger('Stream Re-ingest').error(
                    `${output.stdout} ${output.stderr}`
                );
                res.status(
                    HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR
                ).send(API_ERRORS.PCAP_EXTRACT_METADATA_ERROR);
            });
    },
    pcapSingleStreamIngest,
    (req, res) => {
        res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
    }
);

/* Get all frames for stream */
router.get('/:pcapID/stream/:streamID/frames', (req, res) => {
    const { pcapID, streamID } = req.params;

    if (fs.folderExists(`${getUserFolder(req)}/${pcapID}`)) {
        const path = `${getUserFolder(req)}/${pcapID}/${streamID}`;

        const frames = fs
            .getAllFirstLevelFolders(path)
            .map(frame =>
                fs.readFile(`${path}/${frame.id}/${CONSTANTS.META_FILE}`)
            );

        Promise.all(frames).then(data => res.send(data));
    } else {
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send(
            API_ERRORS.RESOURCE_NOT_FOUND
        );
    }
});

/*** FRAME ***/

/* Get packets.json file for a frame */
router.get('/:pcapID/stream/:streamID/frame/:frameID/packets', (req, res) => {
    const { pcapID, streamID, frameID } = req.params;
    const packetsFilePath = `${getUserFolder(
        req
    )}/${pcapID}/${streamID}/${frameID}/packets.json`;

    fs.sendFileAsResponse(packetsFilePath, res);
});

/* Get png file for a frame */
router.get('/:pcapID/stream/:streamID/frame/:frameID/png', (req, res) => {
    const { pcapID, streamID, frameID } = req.params;
    const pngFilePath = `${getUserFolder(
        req
    )}/${pcapID}/${streamID}/${frameID}/frame.png`;

    fs.sendFileAsResponse(pngFilePath, res);
});

/*** Audio ***/
/* Get mp3 file for an audio stream */

function renderMp3(req, res) {
    const { pcapID, streamID } = req.params;
    var { channels } = req.query;

    if (channels === undefined || channels === '') {
        channels = '0,1'; // keep the 2 first channels by default
    }

    Stream.findOne({ id: streamID })
        .exec()
        .then((data) => {
            const folderPath = `${getUserFolder(req)}/${pcapID}/${streamID}/`;
            const rawFilePath = `${folderPath}/raw`;
            const mp3FilePath = `${folderPath}/audio-${channels}.mp3`;
            const encodingBits =
                data.media_specific.encoding == 'L24' ? 24 : 16;
            const sampling = parseInt(data.media_specific.sampling) / 1000;
            const channelNumber = data.media_specific.number_channels;
            // ffmpeg supports up to 16 input channels
            const channelMapping = channels
                .split(',')
                .slice(0, 16)
                .map(function(i) {
                    return '-map_channel 0.0.' + i;
                })
                .join(' ');
            const ffmpegCommand = `ffmpeg -hide_banner -y -f s${encodingBits}be -ar ${sampling}k -ac ${channelNumber} -i "${rawFilePath}" ${channelMapping} -codec:a libmp3lame -qscale:a 2 "${mp3FilePath}"`;

            logger('render-mp3').info(`Command: ${ffmpegCommand}`);
            exec(ffmpegCommand)
                .then(output => {
                    logger('render-mp3').info(output.stdout);
                    logger('render-mp3').info(output.stderr);
                    const userID = req.session.passport.user.id;
                    websocketManager.instance().sendEventToUser(userID, {
                        event: WS_EVENTS.MP3_FILE_RENDERED,
                        data: { channels: channels },
                    });
                })
                .catch(output => {
                    logger('render-mp3').error(output.stdout);
                    logger('render-mp3').error(output.stderr);
                    const userID = req.session.passport.user.id;
                    websocketManager.instance().sendEventToUser(userID, {
                        event: WS_EVENTS.MP3_FILE_FAILED,
                    });
                });
            res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
        })
        .catch(() =>
            res
                .status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND)
                .send(API_ERRORS.RESOURCE_NOT_FOUND)
        );
}

router.get('/:pcapID/stream/:streamID/downloadmp3', (req, res) => {
    const { pcapID, streamID } = req.params;
    var { channels } = req.query;
    if ((channels === undefined) || (channels === '')) {
        channels = '0,1'; // keep the 2 first channels by default
    }
    const folderPath = `${getUserFolder(req)}/${pcapID}/${streamID}`;
    const filePath = `${folderPath}/audio-${channels}.mp3`;

    if (fs.fileExists(filePath)) {
        fs.sendFileAsResponse(filePath, res);
        logger('download-mp3').info('Mp3 file already exists');
    } else {
        renderMp3(req, res);
    }
});

router.get('/:pcapID/stream/:streamID/rendermp3', (req, res) => {
    renderMp3(req, res);
});

module.exports = router;
