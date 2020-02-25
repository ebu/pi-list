const util = require('util');
const fs = require('fs');
const _ = require('lodash');
const child_process = require('child_process');
const sdp_parser = require('sdp-transform');
const sdpoker = require('sdpoker');
const uuidv1 = require('uuid/v1');
const program = require('../programArguments');
const websocketManager = require('../../managers/websocket');
const logger = require('../logger');
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
const { doRtpAnalysis } = require('../../analyzers/rtp');
const { doMulticastAddressAnalysis } = require('../../analyzers/multicast.js');
const constants = require('../../enums/analysis');
const glob = util.promisify(require('glob'));
const { zipFilesExt } = require('../zip');

function getUserFolder(req) {
    return `${program.folder}/${req.session.passport.user.id}`;
}

function generateRandomPcapFilename(file) {
    const extensionCharIdx = file.originalname.lastIndexOf('.');
    const fileExtension = extensionCharIdx > -1 ? '.' + file.originalname.substring(extensionCharIdx + 1) : '';

    return `${Date.now()}_${uuidv1()}${fileExtension}`;
}

function generateRandomPcapDefinition(req, optionalPcapId) {
    const pcapId = optionalPcapId || uuidv1();
    return {
        uuid: pcapId,
        folder: `${getUserFolder(req)}/${pcapId}`,
    };
}

/**
 * Provides a command-line string to be appended
 * @returns {{withMongo: string, withInflux: string}}
 */
function argumentsToCmd() {
    return {
        withMongo: `-mongo_url ${program.databaseURL}`,
        withInflux: `-influx_url ${program.influxURL}`,
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
    const userID = req.session.passport.user.id;
    const pcapId = req.pcap.uuid;
    const originalFilename = req.body.originalFilename || req.file.originalname;

    websocketManager.instance().sendEventToUser(userID, {
        event: WS_EVENTS.PCAP_FILE_RECEIVED,
        data: {
            id: pcapId,
            file_name: originalFilename,
            pcap_file_name: req.file.filename,
            date: Date.now(),
            progress: 33,
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
            .then(output => {
                if (output.stdout.length > 0) logger('pcap-conversion-process').info(output.stdout);
                if (output.stderr.length > 0) logger('pcap-conversion-process').info(output.stderr);

                res.locals.pcapFileName =
                    uploadedFileExtension !== ''
                        ? req.file.filename.replace(fileExtensionRegex, 'pcap')
                        : req.file.filename + '.pcap';
                res.locals.pcapFilePath = convertedFilePath;
                next();
            })
            .catch(err => {
                logger('pcap-conversion-process').info('Failed to convert capture file');
                logger('pcap-conversion--process').info(err.toString());

                websocketManager.instance().sendEventToUser(userID, {
                    event: WS_EVENTS.PCAP_FILE_FAILED,
                    data: { id: pcapId, progress: 0, error: err.toString() },
                });
            });
    } else {
        res.locals.pcapFileName = req.file.filename;
        res.locals.pcapFilePath = uploadedFilePath;
        next();
    }
}

function pcapPreProcessing(req, res, next) {
    const userID = req.session.passport.user.id;
    const pcapId = req.pcap.uuid;
    const { withMongo } = argumentsToCmd();

    const streamPreProcessorCommand = `"${program.cpp}/stream_pre_processor" "${res.locals.pcapFilePath}" ${pcapId} ${withMongo}`;

    const originalFilename = req.body.originalFilename || req.file.originalname;

    logger('stream-pre-processor').info(`Command: ${streamPreProcessorCommand}`);

    exec(streamPreProcessorCommand)
        .then(output => {
            logger('stream-pre-process').info(output.stdout);
            logger('stream-pre-process').info(output.stderr);

            return Pcap.findOneAndUpdate(
                { id: pcapId },
                {
                    file_name: originalFilename,
                    capture_file_name: req.file.filename,
                    pcap_file_name: res.locals.pcapFileName,
                    owner_id: userID,
                    generated_from_network: req.pcap.from_network ? true : false,
                },
                { new: true }
            ).exec();
        })
        .then(data => {
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_PROCESSED,
                data: Object.assign({}, data._doc, { progress: 66 }),
            });

            next();
        })
        .catch(err => {
            logger('pcap-pre-processing').error(`exception: ${err.toString()}`);

            Pcap.findOneAndUpdate(
                { id: pcapId },
                {
                    file_name: originalFilename,
                    capture_file_name: req.file.filename,
                    pcap_file_name: res.locals.pcapFileName,
                    owner_id: userID,
                    generated_from_network: req.pcap.from_network ? true : false,
                    error: err.toString(),
                },
                { new: true }
            ).exec();

            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_FAILED,
                data: { id: pcapId, progress: 0, error: err.toString() },
            });
        });
}

const postProcessSdpFiles = async (pcapId, folder) => {
    Pcap.findOne({ id: pcapId })
        .exec()
        .then(async data => {
            const filename = data.file_name.replace(/\.[^\.]*$/, '-sdp.zip');
            const files = await glob(`${folder}/**/*.sdp`);
            await zipFilesExt(files, `${folder}/${filename}`, 'sdp');
        })
};

// Returns undefined on success; otherwise, the error.
const runAnalysis = async params => {
    const { pcapId, pcapFolder, streamID, pcapFile, userId, analysisProfileFile } = params;
    const { withMongo, withInflux } = argumentsToCmd();

    const streamOption = streamID ? `-s ${streamID}` : '';
    const profileFile = `-p ${analysisProfileFile}`;
    const st2110ExtractorCommand = `"${program.cpp}/st2110_extractor" ${pcapId} "${pcapFile}" "${pcapFolder}" ${withInflux} ${withMongo} ${streamOption} ${profileFile}`;

    logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);

    try {
        const output = await exec(st2110ExtractorCommand);

        Pcap.findOne({ id: pcapId }).exec()
            .then(pcap => {
                if (pcap.error) {
                    Pcap.findOneAndUpdate(
                        { id: pcapId },
                        { error: "", },
                        { new: true }).exec()
                }
            });

        logger('st2110_extractor').info(output.stdout);
        logger('st2110_extractor').info(output.stderr);
        await postProcessSdpFiles(pcapId, pcapFolder);
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

        const userID = userId;
        websocketManager.instance().sendEventToUser(userID, {
            event: WS_EVENTS.PCAP_FILE_FAILED,
            data: { id: pcapId, progress: 0, error: err.toString() },
        });

        return err;
    }
};

function resetStreamCountersAndErrors(req, res, next) {
    const { streamID } = req.params;

    Stream.findOne({ id: streamID })
        .exec()
        .then(data => {
            if (typeof data.statistics !== 'undefined') {
                data.statistics.packet_count = 0;
                data.statistics.dropped_packet_count = 0;
                if (data.media_type == 'audio') {
                    data.statistics.sample_count = 0;
                } else {
                    data.statistics.frame_count = 0;
                }
            }

            if (typeof data.error_list !== 'undefined') {
                data.error_list = [];
            }

            Stream.findOneAndUpdate({ id: streamID }, data)
                .exec()
                .then(data => {
                    next();
                });
        })
        .catch(err => {
            logger('stream-reset-counters').error(`exception: ${err}`);
        });
}

const pcapFullAnalysis = async (req, res, next) => {
    const params = {
        pcapId: req.pcap.uuid,
        pcapFolder: req.pcap.folder,
        pcapFile: res.locals.pcapFilePath,
        userId: req.session.passport.user.id,
        analysisProfileFile: req.analysisProfileFile,
    };

    const result = await runAnalysis(params);
    next(result);
};

const singleStreamAnalysis = async (req, res, next) => {
    const params = {
        pcapId: req.pcap.uuid,
        pcapFolder: req.pcap.folder,
        streamID: req.params.streamID,
        pcapFile: req.file.path,
        userId: req.session.passport.user.id,
        analysisProfileFile: req.analysisProfileFile,
    };

    const result = await runAnalysis(params);
    next(result);
};

function addStreamErrorsToSummary(stream, error_list) {
    stream.error_list.forEach(error =>
        error_list.push({
            stream_id: stream.id,
            value: error,
        })
    );
}

function addWarningsToSummary(pcap, warning_list) {
    if (pcap.truncated) {
        warning_list.push({
            stream_id: null,
            value: { id: constants.warnings.pcap.truncated },
        });
    }
}

const pcapConsolidation = async (req, res, next) => {
    const pcapId = req.pcap.uuid;

    const summary = {
        error_list: [],
        warning_list: [],
    };

    const streams = _.get(req, 'streams', []);
    streams.forEach(stream => addStreamErrorsToSummary(stream, summary.error_list));

    const pcapData = await Pcap.findOne({ id: pcapId }).exec();
    addWarningsToSummary(pcapData, summary.warning_list);
    const analysis_profile = req.analysisProfile;
    await Pcap.findOneAndUpdate({ id: pcapId }, { summary, analysis_profile }).exec();
    next();
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
        .then(streams => doAudioAnalysis(pcapId, streams))
        .then(streams => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch(err => {
            logger('audio-consolidation').error(`exception: ${err}`);
        });
}

function ancillaryConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: 'ancillary_data' })
        .exec()
        .then(streams => doAncillaryAnalysis(req, streams))
        .then(streams => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch(err => {
            logger('ancillary-consolidation').error(`exception: ${err}`);
        });
}

function ttmlConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: 'ttml' })
        .exec()
        .then(streams => doTtmlAnalysis(req, streams))
        .then(streams => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch(err => {
            logger('ttml-consolidation').error(`exception: ${err}`);
        });
}

function unknownConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: 'unknown' })
        .exec()
        .then(streams => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch(err => {
            logger('unknown-consolidation').error(`exception: ${err}`);
        });
}

function commonConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    const streams = _.get(req, 'streams', []);

    doRtpAnalysis(pcapId, streams)
        .then(() => doMulticastAddressAnalysis(pcapId, streams))
        .then(() => next())
        .catch(err => {
            logger('common-consolidation').error(`exception: ${err}`);
        });
}

function pcapIngestEnd(req, res, next) {
    const userID = req.session.passport.user.id;
    const pcapId = req.pcap.uuid;

    Pcap.findOne({ id: pcapId })
        .exec() // it returns the mongo db record of the PCAP
        .then(pcapData => {
            // Everything is done, we must notify the GUI
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_PROCESSING_DONE,
                data: Object.assign({}, pcapData._doc, { progress: 100 }),
            });
        });
}

function sdpCheck(req, res, next) {
    const userID = req.session.passport.user.id;
    sdpoker
        .getSDP(req.file.path, false)
        .then(sdp => {
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

            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.SDP_VALIDATION_RESULTS,
                data: {
                    errors: errors.map(e => e.toString()),
                },
            });

            next();
        })
        .catch(err => {
            logger('sdp-check').error(`exception: ${err}`);
        });
}

function sdpParseIp(req, res, next) {
    const userID = req.session.passport.user.id;
    const readFileAsync = util.promisify(fs.readFile);

    readFileAsync(req.file.path)
        .then(sdp => {
            const parsed = sdp_parser.parse(sdp.toString());

            // grab src and dst IPs for each stream
            const streams = parsed.media.map(function(media) {
                const dstAddr = _.get(media, 'sourceFilter.destAddress');
                const dstPort = _.get(media, 'port');
                const src = _.get(media, 'sourceFilter.srcList');
                return { dstAddr, dstPort, src };
            });

            // notify the live subscription panel
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.IP_PARSED_FROM_SDP,
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
        .catch(err => {
            logger('sdp-parse').error(`exception: ${err}`);
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.IP_PARSED_FROM_SDP,
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
