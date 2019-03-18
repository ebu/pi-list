const util = require('util');
const _ = require('lodash');
const child_process = require('child_process');
const fs = require('fs');
const sdp_parser = require('sdp-transform');
const sdpoker = require('sdpoker');
const uuidv1 = require('uuid/v1');
const program = require('./programArguments');
const websocketManager = require('../managers/websocket');
const influxDbManager = require('../managers/influx-db');
const logger = require('./logger');
const API_ERRORS = require('../enums/apiErrors');
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
const exec = util.promisify(child_process.exec);
const Pcap = require('../models/pcap');
const Stream = require('../models/stream');
const WS_EVENTS = require('../enums/wsEvents');
const { doVideoAnalysis } = require('../analyzers/video');
const constants = require('../enums/analysis');

function getUserFolder(req) {
    return `${program.folder}/${req.session.passport.user.id}`;
}

function generateRandomPcapFilename() {
    return `${Date.now()}_${uuidv1()}.pcap`;
}

function generateRandomPcapDefinition(req, optionalPcapId) {
    const pcapId = optionalPcapId || uuidv1();
    return {
        uuid: pcapId,
        folder: `${getUserFolder(req)}/${pcapId}`
    };
}

/**
 * Provides a command-line string to be appended
 * @returns {{withMongo: string, withInflux: string}}
 */
function argumentsToCmd() {
    return {
        withMongo: `-mongo_url ${program.databaseURL}`,
        withInflux: `-influx_url ${program.influxURL}`
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

function pcapPreProcessing(req, res, next) {
    const userID = req.session.passport.user.id;
    const pcapId = req.pcap.uuid;
    const { withMongo } = argumentsToCmd();

    const streamPreProcessorCommand = `"${program.cpp}/stream_pre_processor" "${req.file.path}" ${pcapId} ${withMongo}`;

    websocketManager.instance().sendEventToUser(userID, {
        event: WS_EVENTS.PCAP_FILE_RECEIVED,
        data: {
            id: pcapId,
            file_name: req.file.originalname,
            pcap_file_name: req.file.filename,
            date: Date.now(),
            progress: 33
        }
    });

    logger('stream-pre-processor').info(`Command: ${streamPreProcessorCommand}`);
    exec(streamPreProcessorCommand)
        .then((output) => {
            logger('stream-pre-process').info(output.stdout);
            logger('stream-pre-process').info(output.stderr);

            return Pcap.findOneAndUpdate({ id: pcapId },
                {
                    file_name: req.file.originalname,
                    pcap_file_name: req.file.filename,
                    owner_id: userID,
                    generated_from_network: req.pcap.from_network ? true : false
                },
                { new: true }).exec();
        })
        .then((data) => {
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_PROCESSED,
                data: Object.assign({}, data._doc, { progress: 66 })
            });

            next();
        })
        .catch((output) => {
            logger('pcap-pre-processing').error(`exception: ${output} ${output.stdout}`);
            logger('pcap-pre-processing').error(`exception: ${output} ${output.stderr}`);

            Pcap.findOneAndUpdate({ id: pcapId },
                {
                    file_name: req.file.originalname,
                    pcap_file_name: req.file.filename,
                    owner_id: userID,
                    generated_from_network: req.pcap.from_network ? true : false,
                    error: output.stdout
                },
                { new: true }).exec();

            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_FAILED,
                data: { id: pcapId, progress: 0, error: output.stdout }
            });
        });
}

function pcapFullAnalysis(req, res, next) {
    const pcapId = req.pcap.uuid;
    const pcap_folder = req.pcap.folder;

    const { withMongo, withInflux } = argumentsToCmd();

    const st2110ExtractorCommand =
        `"${program.cpp}/st2110_extractor" ${pcapId} "${req.file.path}" "${pcap_folder}" ${withInflux} ${withMongo}`;


    logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);
    exec(st2110ExtractorCommand)
        .then((output) => {
            logger('st2110_extractor').info(output.stdout);
            logger('st2110_extractor').info(output.stderr);
            next();
        })
        .catch((output) => {
            logger('pcap-full-analysis').error(`exception: ${output} ${output.stdout}`);
            logger('pcap-full-analysis').error(`exception: ${output} ${output.stderr}`);

            Pcap.findOneAndUpdate({ id: pcapId },
                {
                    error: output.stdout
                },
                { new: true }).exec();


            const userID = req.session.passport.user.id;
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_FAILED,
                data: { id: pcapId, progress: 0, error: output.stdout }
            });
        });
}

function singleStreamAnalysis(req, res, next) {
    const { streamID } = req.params;
    const pcapId = req.pcap.uuid;
    const pcap_folder = req.pcap.folder;
    const pcap_location = req.file.path;

    const { withMongo, withInflux } = argumentsToCmd();

    const st2110ExtractorCommand =
        `"${program.cpp}/st2110_extractor" ${pcapId} "${pcap_location}" "${pcap_folder}" ${withInflux} ${withMongo} -s "${streamID}"`;

    logger('st2110_extractor').info(`Command: ${st2110ExtractorCommand}`);
    exec(st2110ExtractorCommand)
        .then((output) => {
            logger('st2110_extractor').info(output.stdout);
            logger('st2110_extractor').info(output.stderr);
            next();
        })
        .catch((output) => {
            logger('pcap-full-analysis').error(`exception: ${output} ${output.stdout}`);
            logger('pcap-full-analysis').error(`exception: ${output} ${output.stderr}`);
        });
}

function addStreamErrorsToSummary(stream, error_list) {
    stream.error_list.forEach(error => error_list.push({
        stream_id: stream.id,
        value: error
    }));
}

function addWarningsToSummary(pcap, warning_list) {
    if (pcap.truncated) {
        warning_list.push({
            stream_id: null,
            value: { id: constants.warnings.pcap.truncated }
        });
    }
}

function pcapConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;

    const summary = {
        error_list: [],
        warning_list: [],
    };

    const streams = _.get(req, 'streams', []);
    streams.forEach(stream => addStreamErrorsToSummary(stream, summary.error_list));

    return Pcap.findOne({ id: pcapId }).exec() // it returns the mongo db record of the PCAP
        .then(pcapData => {
            addWarningsToSummary(pcapData, summary.warning_list);
        })
        .then(() => Pcap.findOneAndUpdate({ id: pcapId }, { summary }).exec())
        .then(() => next());
}

function addStreamsToReq(streams, req) {
    const allStreams = _.get(req, 'streams', []);
    allStreams.push(...streams);
    req.streams = allStreams;
}

function videoConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;
    Stream.find({ pcap: pcapId, media_type: "video" }).exec()
        .then(streams => doVideoAnalysis(pcapId, streams))
        .then(streams => {
            addStreamsToReq(streams, req);
        })
        .then(() => next())
        .catch((output) => {
            logger('video-consolidation').error(`exception: ${output}`);
            logger('video-consolidation').error(`exception: ${output}`);
        });
}

function audioConsolidation(req, res, next) {
    const pcapId = req.pcap.uuid;

    // post-process every audio stream for delay analysis
    Stream.find({ pcap: pcapId, media_type: "audio" }).exec()
        .then(streams => {
            const influxPromises = [];
            streams.forEach(stream => {
                influxPromises.push(influxDbManager.getAudioTimeStampedDelayFactorAmp(pcapId, stream.id));
                influxPromises.push(Stream.findOne({ id: stream.id }));
            });
            return Promise.all(influxPromises);
        })
        .then(values => {
            let mongoPromises = [];
            // values = [ [influx1], stream1, [influx2], stream2, ... ]
            for (let i = 0; i < values.length; i += 2) {
                let tsdf_max, res;
                if (values[i] == false) res = 'undefined';
                else tsdf_max = values[i][0].max;

                const stream = values[i + 1];
                if (!stream.media_specific) continue; // can't do anything without associated stream
                const packet_time = stream.media_specific.packet_time * 1000; // usec

                // determine compliance based on EBU's recommendation
                if (tsdf_max < packet_time) res = 'narrow';
                else if (tsdf_max > 17 * packet_time) res = 'not_compliant';
                else if (!tsdf_max) res = 'undefined';
                else res = 'wide';

                mongoPromises.push(Stream.findOneAndUpdate({ id: stream.id },
                    { global_audio_analysis: { tsdf_max: tsdf_max, tsdf_compliance: res } }, { new: true }));
            }
            return Promise.all(mongoPromises);
        })
        .then(values => {
            next();
        })
        .catch((output) => {
            logger('audio-consolidation').error(`exception: ${output} ${output.stdout}`);
            logger('audio-consolidation').error(`exception: ${output} ${output.stderr}`);
        });
}

function pcapIngestEnd(req, res, next) {
    const userID = req.session.passport.user.id;
    const pcapId = req.pcap.uuid;

    Pcap.findOne({ id: pcapId }).exec() // it returns the mongo db record of the PCAP
        .then(pcapData => {
            // Everything is done, we must notify the GUI
            websocketManager.instance().sendEventToUser(userID, {
                event: WS_EVENTS.PCAP_FILE_PROCESSING_DONE,
                data: Object.assign({}, pcapData._doc, { progress: 100 })
            });
        });
}

function sdpCheck(req, res, next) {
    const userID = req.session.passport.user.id;
    sdpoker.getSDP(req.file.path, false)
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
                    errors: errors.map(e => e.toString())
                }
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
        .then((sdp) => {
            const parsed = sdp_parser.parse(sdp.toString());

            console.log(parsed);
            // grab src and dst IPs for each stream
            const streams = parsed.media.map(function (media) {
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
                    streams: streams
                }
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
                }
            });

            next();
        });
}

function sdpDelete(req, res, next) {
    fs.unlinkSync(req.file.path);
}

module.exports = {
    getUserFolder,
    generateRandomPcapFilename,
    generateRandomPcapDefinition,
    pcapIngest: [
        pcapFileAvailableFromReq,
        pcapPreProcessing,
        pcapFullAnalysis,
        videoConsolidation,
        audioConsolidation,
        pcapConsolidation,
        pcapIngestEnd
    ],
    pcapSingleStreamIngest: [
        pcapFileAvailableFromReq,
        singleStreamAnalysis,
        videoConsolidation,
        audioConsolidation,
        pcapConsolidation
    ],
    sdpIngest: [
        sdpParseIp,
        sdpCheck,
        sdpDelete
    ]
};
