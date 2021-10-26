const util = require('util');
const fs = require('fs');
const _ = require('lodash');
const child_process = require('child_process');
const sdp_parser = require('sdp-transform');
const sdpoker = require('sdpoker');
const uuidv4 = require('uuid/v4');
const program = require('../programArguments');
const websocketManager = require('../../managers/websocket');
import logger from '../logger';
const API_ERRORS = require('../../enums/apiErrors');
const HTTP_STATUS_CODE = require('../../enums/httpStatusCode');
const exec = util.promisify(child_process.exec);
const Pcap = require('../../models/pcap');
const Stream = require('../../models/stream');
const WS_EVENTS = require('../../enums/wsEvents');
const { doVideoAnalysis } = require('../../analyzers/video');
const { doAudioAnalysis } = require('../../analyzers/audio');
const { doAncillaryAnalysis } = require('../../analyzers/ancillary');
const { doTtmlAnalysis } = require('../../analyzers/ttml/ttml');
const { doCommonConsolidation } = require('../../analyzers/common');
const { doPcapConsolidation } = require('../../analyzers/pcap');
const glob = util.promisify(require('glob'));
const { zipFilesExt } = require('../zip');
import { mq } from '@bisect/bisect-core-ts-be';
import { api } from '@bisect/ebu-list-sdk';
const { getUserId } = require('../../auth/middleware');

export function getUserFolder(req) {
    const userId = getUserId(req);
    return `${program.folder}/${userId}`;
}

function generateRandomPcapFilename(file) {
    const extensionCharIdx = file.originalname.lastIndexOf('.');
    const fileExtension = extensionCharIdx > -1 ? '.' + file.originalname.substring(extensionCharIdx + 1) : '';

    return `${Date.now()}_${uuidv4()}${fileExtension}`;
}

function generateRandomPcapDefinition(req, optionalPcapId) {
    const { pcapID } = req.query;
    const id = pcapID || uuidv4();
    return {
        uuid: id,
        folder: `${getUserFolder(req)}/${id}`,
    };
}

/**
 * Provides a command-line string to be appended
 * @returns {{withMongo: string, withInflux: string, withRabbitMq: string}}
 */
function argumentsToExtractor(extractFrames) {
    return {
        withMongo: `-mongo_url ${program.databaseURL}`,
        withInflux: `-influx_url ${program.influxURL}`,
        withRabbitMq: `-rabbit_mq_url ${program.rabbitmqUrl}`,
        withExtractFrames: extractFrames ? ' -e' : '',
    };
}

function pcapFileAvailableFromReq(req, res, next) {
    if (!req.file) {
        logger('ingest').error('Pcap file not received!');
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.BAD_REQUEST).send(API_ERRORS.PCAP_FILE_TO_UPLOAD_NOT_FOUND);
    } else {
        next();
    }
}

/**
 * Given a network capture file, convert it to PCAP format before ingestion.
 */
function pcapFormatConversion(req, res, next) {
    const userId = getUserId(req);
    const pcapId = req.pcap.uuid;
    const originalFilename = req.body.originalFilename || req.file.originalname;

    websocketManager.instance().sendEventToUser(userId, {
        event: api.wsEvents.Pcap.received,
        data: {
            id: pcapId,
            file_name: originalFilename,
            pcap_file_name: req.file.filename,
            date: Date.now(),
            progress: 0,
        },
    });

    const uploadedFilePath = req.file.path;
    const extensionCharIdx = uploadedFilePath.lastIndexOf('.');
    const uploadedFileExtension = extensionCharIdx > -1 ? uploadedFilePath.substring(extensionCharIdx + 1) : '';

    if (uploadedFileExtension.toLowerCase() !== 'pcap') {
        const fileExtensionRegex = new RegExp(uploadedFileExtension + '$', 'i');
        let convertedFilePath = '';
        if (uploadedFileExtension !== '') {
            convertedFilePath = uploadedFilePath.replace(fileExtensionRegex, 'pcap');
        } else convertedFilePath = uploadedFilePath + '.pcap';

        const editcapConversionCommand = `editcap ${uploadedFilePath} ${convertedFilePath} -F pcap`;
        logger('pcap-format-conversion').info(`Command: ${editcapConversionCommand}`);

        exec(editcapConversionCommand)
            .then((output) => {
                if (output.stdout.length > 0) logger('pcap-conversion-process').info(output.stdout);
                if (output.stderr.length > 0) logger('pcap-conversion-process').info(output.stderr);

                res.locals.pcapFileName =
                    uploadedFileExtension !== ''
                        ? req.file.filename.replace(fileExtensionRegex, 'pcap')
                        : req.file.filename + '.pcap';
                res.locals.pcapFilePath = convertedFilePath;
                next();
            })
            .catch((err) => {
                logger('pcap-conversion-process').info('Failed to convert capture file');
                logger('pcap-conversion--process').info(err.toString());

                websocketManager.instance().sendEventToUser(userId, {
                    event: api.wsEvents.Pcap.failed,
                    data: { id: pcapId, progress: 0, error: err.toString() },
                });
            });
    } else {
        res.locals.pcapFileName = req.file.filename;
        res.locals.pcapFilePath = uploadedFilePath;
        next();
    }
}

const preprocessorRequestSender = mq.createQueueSender(program.rabbitmqUrl, api.mq.queues.preprocessorRequest);
const preprocessorAnnounceReceiver = mq.createExchangeReceiver(
    program.rabbitmqUrl,
    api.mq.exchanges.preprocessorStatus,
    [api.mq.exchanges.preprocessorStatus.keys.announce]
);

const outstandingPreprocessorRequests = {};

function handlePreprocessorResponse(msg) {
    try {
        const message = JSON.parse(msg.toString());
        let preprocessorRequest = null;

        if (outstandingPreprocessorRequests[message.data.pcap.id]) {
            preprocessorRequest = outstandingPreprocessorRequests[message.data.pcap.id];
            delete outstandingPreprocessorRequests[message.data.pcap.id];
        } else {
            // logger('stream-pre-processor').info(`Pcap ID not found in outstand jobs: ${message.data.pcap.id}`);
            return;
        }

        const { req, res, next } = preprocessorRequest;

        const userId = getUserId(req);
        const pcapId = req.pcap.uuid;

        const originalFilename = req.body.originalFilename || req.file.originalname;

        logger('stream-pre-processor').info(`${pcapId} vs. ${message.data.pcap.id}`);
        if (pcapId !== message.data.pcap.id) return;

        if (message.error) {
            logger('stream-pre-processor').error(`Failed process the Pcap file: ${message.error}`);

            Pcap.findOneAndUpdate(
                { id: pcapId },
                {
                    file_name: originalFilename,
                    capture_file_name: req.file.filename,
                    pcap_file_name: res.locals.pcapFileName,
                    owner_id: userId,
                    generated_from_network: req.pcap.from_network ? true : false,
                    error: message.error,
                },
                { upsert: true }
            ).exec();

            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.Pcap.failed,
                data: { id: pcapId, progress: 0, error: message.error },
            });

            return;
        }

        const pcapData = message.data.pcap;
        const pcapAdditionalData = {
            file_name: originalFilename,
            capture_file_name: req.file.filename,
            pcap_file_name: res.locals.pcapFileName,
            owner_id: userId,
            generated_from_network: req.pcap.from_network ? true : false,
        };

        Pcap.findOneAndUpdate({ id: pcapId }, _.merge(pcapData, pcapAdditionalData), { upsert: true, new: true })
            .exec()
            .then(function (pcapDbData) {
                logger('stream-pre-processor').info(`Added new Pcap file to the database: ${pcapId}`);

                Stream.insertMany(message.data.streams)
                    .then(function (streamsDbData) {
                        logger('stream-pre-processor').info(
                            `Added ${message.data.streams.length} new streams to the database extract from Pcap with id ${pcapId}`
                        );

                        websocketManager.instance().sendEventToUser(userId, {
                            event: api.wsEvents.Pcap.preProcessed,
                            data: Object.assign({}, pcapDbData._doc),
                        });

                        next();
                        return;
                    })
                    .catch(function (err) {
                        logger('stream-pre-processor').error(`Failed to add Streams to the database: ${err}`);

                        websocketManager.instance().sendEventToUser(userId, {
                            event: api.wsEvents.Pcap.failed,
                            data: { id: pcapId, progress: 0, error: err.toString() },
                        });

                        return;
                    });
            })
            .catch(function (err) {
                logger('stream-pre-processor').error(`Failed to add Pcap analysis to the database: ${err}`);

                Pcap.findOneAndUpdate(
                    { id: pcapId },
                    {
                        file_name: originalFilename,
                        capture_file_name: req.file.filename,
                        pcap_file_name: res.locals.pcapFileName,
                        owner_id: userId,
                        generated_from_network: req.pcap.from_network ? true : false,
                        error: err.toString(),
                    },
                    { upsert: true }
                ).exec();

                websocketManager.instance().sendEventToUser(userId, {
                    event: api.wsEvents.Pcap.failed,
                    data: { id: pcapId, progress: 0, error: err.toString() },
                });

                return;
            });
    } catch (err) {
        logger('stream-pre-processor').error(`${err}`);

        websocketManager.instance().sendEventToUser(userId, {
            event: api.wsEvents.Pcap.failed,
            data: { id: pcapId, progress: 0, error: err.toString() },
        });

        return;
    }
}

preprocessorAnnounceReceiver.emitter.on(mq.onMessageKey, handlePreprocessorResponse);

function pcapPreProcessing(req, res, next) {
    logger('stream-pre-processor').info(
        `Pcap original file name: ${req.body.originalFilename || req.file.originalname}`
    );
    logger('stream-pre-processor').info(`Pcap ID: ${req.pcap.uuid}`);

    const key = req.pcap.uuid;
    outstandingPreprocessorRequests[key] = { req, res, next };

    preprocessorRequestSender.send({
        msg: {
            action: 'preprocessing.request',
            workflow_id: uuidv4(),
            pcap_id: req.pcap.uuid,
            pcap_path: res.locals.pcapFilePath,
        },
        persistent: mq.persistent,
    });
}

const postProcessSdpFiles = async (pcapId, folder) => {
    Pcap.findOne({ id: pcapId })
        .exec()
        .then(async (data) => {
            const filename = data.file_name.replace(/\.[^\.]*$/, '-sdp.zip').replace(RegExp('/', 'g'), '-');
            const files = await glob(`${folder}/**/*.sdp`);
            await zipFilesExt(files, `${folder}/${filename}`, 'sdp');
        });
};

// Returns undefined on success; otherwise, the error.
// const runAnalysis = async (params) => {
//     const { pcapId, pcapFolder, streamID, pcapFile, userId, analysisProfileFile } = params;
//     const { withMongo, withInflux, withRabbitMq } = argumentsToCmd();

//     const streamOption = streamID ? `-s ${streamID}` : '';
//     const profileFile = `-p ${analysisProfileFile}`;
//     const st2110ExtractorCommand = `"${program.cpp}/st2110_extractor" ${pcapId} "${pcapFile}" "${pcapFolder}" ${withInflux} ${withMongo} ${withRabbitMq} ${streamOption} ${profileFile}`;

//     logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);

//     try {
//         const output = await exec(st2110ExtractorCommand);

//         Pcap.findOne({ id: pcapId })
//             .exec()
//             .then((pcap) => {
//                 if (pcap.error) {
//                     Pcap.findOneAndUpdate({ id: pcapId }, { error: '' }, { new: true }).exec();
//                 }
//             });

//         logger('st2110_extractor').info(output.stdout);
//         logger('st2110_extractor').info(output.stderr);
//         // await postProcessSdpFiles(pcapId, pcapFolder);
//         return;
//     } catch (err) {
//         logger('pcap-full-analysis').error(`exception: ${err}`);

//         Pcap.findOneAndUpdate(
//             { id: pcapId },
//             {
//                 error: err.toString(),
//             },
//             { new: true }
//         ).exec();

//         websocketManager.instance().sendEventToUser(userId, {
//             event: api.wsEvents.Pcap.failed,
//             data: { id: pcapId, progress: 0, error: err.toString() },
//         });

//         return err;
//     } finally {
//         params.extractFrames = true;
//         runAnalysis2(params);
//     }
// };

export const runAnalysis = async (params) => {
    const { pcapId, pcapFolder, streamID, pcapFile, userId, analysisProfileFile, extractFrames } = params;
    const { withMongo, withInflux, withRabbitMq, withExtractFrames } = argumentsToExtractor(extractFrames);

    const streamOption = streamID ? `-s ${streamID}` : '';
    const profileFile = `-p ${analysisProfileFile}`;
    const st2110ExtractorCommand = `"${program.cpp}/st2110_extractor" ${pcapId} "${pcapFile}" "${pcapFolder}" ${withInflux} ${withMongo} ${withRabbitMq} ${streamOption} ${profileFile}${withExtractFrames}`;

    logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);

    try {
        const output = await exec(st2110ExtractorCommand);

        if (extractFrames === false) {
            Pcap.findOne({ id: pcapId })
                .exec()
                .then((pcap) => {
                    if (pcap.error) {
                        Pcap.findOneAndUpdate({ id: pcapId }, { error: '' }, { new: true }).exec();
                    }
                });
        }

        logger('st2110_extractor').info(output.stdout);
        logger('st2110_extractor').info(output.stderr);

        if (extractFrames === true) {
            await postProcessSdpFiles(pcapId, pcapFolder);
        }

        return;
    } catch (err) {
        logger('pcap-full-analysis').error(`exception: ${err}`);

        Pcap.findOneAndUpdate(
            { id: pcapId },
            {
                error: err.toString(),
            },
            { new: true }
        ).exec();

        websocketManager.instance().sendEventToUser(userId, {
            event: api.wsEvents.Pcap.failed,
            data: { id: pcapId, progress: 0, error: err.toString() },
        });

        return err;
    }
};

function resetStreamCountersAndErrors(req, res, next) {
    const { streamID } = req.params;

    Stream.findOne({ id: streamID })
        .exec()
        .then((data) => {
            if (typeof data.statistics !== 'undefined') {
                if (typeof data.statistics.packet_count !== 'undefined') data.statistics.packet_count = 0;
                if (typeof data.statistics.dropped_packet_count !== 'undefined')
                    data.statistics.dropped_packet_count = 0;
                if (typeof data.statistics.sample_count !== 'undefined') data.statistics.sample_count = 0;
                if (typeof data.statistics.frame_count !== 'undefined') data.statistics.frame_count = 0;
                if (typeof data.statistics.wrong_marker_count !== 'undefined') data.statistics.wrong_marker_count = 0;
                if (typeof data.statistics.wrong_field_count !== 'undefined') data.statistics.wrong_field_count = 0;
                if (typeof data.statistics.payload_error_count !== 'undefined') data.statistics.payload_error_count = 0;
            }

            if (typeof data.media_specific.sub_streams !== 'undefined') {
                data.media_specific.sub_streams = [];
            }

            if (typeof data.error_list !== 'undefined') {
                data.error_list = [];
            }

            Stream.findOneAndUpdate({ id: streamID }, data)
                .exec()
                .then((data) => {
                    next();
                });
        })
        .catch((err) => {
            logger('stream-reset-counters').error(`exception: ${err}`);
        });
}

const pcapFullAnalysis = async (req, res, next) => {
    const userId = getUserId(req);

    const params = {
        pcapId: req.pcap.uuid,
        pcapFolder: req.pcap.folder,
        pcapFile: res.locals.pcapFilePath,
        userId: userId,
        analysisProfileFile: req.analysisProfileFile,
    };
    const result = await runAnalysis(params);
    next(result);
};

const singleStreamAnalysis = async (req, res, next) => {
    const userId = getUserId(req);

    const params = {
        pcapId: req.pcap.uuid,
        pcapFolder: req.pcap.folder,
        streamID: req.params.streamID,
        pcapFile: req.file.path,
        userId: userId,
        analysisProfileFile: req.analysisProfileFile,
    };

    const result = await runAnalysis(params);
    next(result);
};

const pcapConsolidation = async (req, res, next) => {
    const pcapId = req.pcap.uuid;
    const streams = _.get(req, 'streams', []);
    const analysis_profile = req.analysisProfile;
    doPcapConsolidation(pcapId, streams, analysis_profile)
        .then(() => next())
        .catch((err) => next(err));
};

function addStreamsToReq(streams, req) {
    const allStreams = _.get(req, 'streams', []);
    allStreams.push(...streams);
    req.streams = allStreams;
}

const videoConsolidation = async (req, res, next) => {
    try {
        const pcapId = req.pcap.uuid;
        const streams = await Stream.find({
            pcap: pcapId,
            media_type: 'video',
        }).exec();

        await doVideoAnalysis(pcapId, streams);
        addStreamsToReq(streams, req);

        next();
    } catch (err) {
        logger('video-consolidation').error(`exception: ${err}`);
    }
};

function audioConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: 'audio' })
        .exec()
        .then((streams) => doAudioAnalysis(pcapId, streams, req.analysisProfile.audio))
        .then((streams) => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch((err) => {
            logger('audio-consolidation').error(`exception: ${err}`);
        });
}

function ancillaryConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: 'ancillary_data' })
        .exec()
        .then((streams) => doAncillaryAnalysis(req, streams))
        .then((streams) => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch((err) => {
            logger('ancillary-consolidation').error(`exception: ${err}`);
        });
}

function ttmlConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: 'ttml' })
        .exec()
        .then((streams) => doTtmlAnalysis(req, streams))
        .then((streams) => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch((err) => {
            logger('ttml-consolidation').error(`exception: ${err}`);
        });
}

function unknownConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: 'unknown' })
        .exec()
        .then((streams) => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch((err) => {
            logger('unknown-consolidation').error(`exception: ${err}`);
        });
}

function commonConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    const streams = _.get(req, 'streams', []);
    doCommonConsolidation(pcapId, streams)
        .then(() => next())
        .catch((err) => {
            logger('common-consolidation').error(`exception: ${err}`);
            next(err);
        });
}

function pcapIngestEnd(req, res, next) {
    const userId = getUserId(req);
    const pcapId = req.pcap.uuid;

    Pcap.findOneAndUpdate({ id: pcapId }, { analyzed: true }, { new: true })
        .exec()
        .then((pcapData) => {
            // Everything is done, we must notify the GUI
            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.Pcap.processingDone,
                data: Object.assign({}, pcapData._doc, { progress: 100 }),
            });
        });
}

function sdpCheck(req, res, next) {
    const userId = getUserId(req);
    sdpoker
        .getSDP(req.file.path, false)
        .then((sdp) => {
            const rfcErrors = sdpoker.checkRFC4566(sdp, {});
            const st2110Errors = sdpoker.checkST2110(sdp, {});
            const errors = rfcErrors.concat(st2110Errors);
            if (errors.length !== 0) {
                // notify instead of printing
                logger('sdp-check').error(`Found ${errors.length} error(s) in SDP file:`);
                for (let c in errors) {
                    logger('sdp-check').error(`${+c + 1}: ${errors[c].message}`);
                }
            }

            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.Sdp.validation_results,
                data: {
                    errors: errors.map((e) => e.toString()),
                },
            });

            next();
        })
        .catch((err) => {
            logger('sdp-check').error(`exception: ${err}`);
        });
}

function sdpParseIp(req, res, next) {
    const userId = getUserId(req);
    const readFileAsync = util.promisify(fs.readFile);

    readFileAsync(req.file.path)
        .then((sdp) => {
            const parsed = sdp_parser.parse(sdp.toString());

            // grab src and dst IPs for each stream
            const streams = parsed.media.map(function (media) {
                const dstAddr = _.get(media, 'sourceFilter.destAddress');
                const dstPort = _.get(media, 'port');
                const src = _.get(media, 'sourceFilter.srcList');
                return { dstAddr, dstPort, src };
            });

            // notify the live subscription panel
            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.Ip.parsed_from_sdp,
                data: {
                    success: true,
                    description: parsed.name,
                    streams: streams,
                },
            });
        })
        .then(() => {
            next();
        })
        .catch((err) => {
            logger('sdp-parse').error(`exception: ${err}`);
            websocketManager.instance().sendEventToUser(userId, {
                event: api.wsEvents.Ip.parsed_from_sdp,
                data: {
                    success: false,
                },
            });

            next();
        });
}

function sdpDelete(req, res, next) {
    fs.unlinkSync(req.file.path);
}

const { getAnalysisProfile } = require('./getProfile');

module.exports = {
    getUserFolder,
    generateRandomPcapFilename,
    generateRandomPcapDefinition,
    runAnalysis,
    pcapIngest: [
        pcapFileAvailableFromReq,
        pcapFormatConversion,
        getAnalysisProfile,
        pcapPreProcessing,
        pcapFullAnalysis,
        videoConsolidation,
        audioConsolidation,
        ancillaryConsolidation,
        ttmlConsolidation,
        unknownConsolidation,
        commonConsolidation,
        pcapConsolidation,
        pcapIngestEnd,
    ],
    pcapReanalyze: [
        getAnalysisProfile,
        pcapPreProcessing,
        pcapFullAnalysis,
        videoConsolidation,
        audioConsolidation,
        ancillaryConsolidation,
        ttmlConsolidation,
        unknownConsolidation,
        commonConsolidation,
        pcapConsolidation,
        pcapIngestEnd,
    ],
    pcapSingleStreamIngest: [
        pcapFileAvailableFromReq,
        resetStreamCountersAndErrors,
        getAnalysisProfile,
        singleStreamAnalysis,
        videoConsolidation,
        audioConsolidation,
        ancillaryConsolidation,
        ttmlConsolidation,
        unknownConsolidation,
        commonConsolidation,
        pcapConsolidation,
    ],
    sdpIngest: [sdpParseIp, sdpCheck, sdpDelete],
};
