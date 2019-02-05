const util = require('util');
const child_process = require('child_process');
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

function getUserFolder(req) {
    return `${program.folder}/${req.session.passport.user.id}`;
}

function generateRandomPcapFilename() {
    return `${Date.now()}_${uuidv1()}.pcap`;
}

function generateRandomPcapDefinition(req) {
    const pcap_uuid = uuidv1();
    return {
        uuid: pcap_uuid,
        folder: `${getUserFolder(req)}/${pcap_uuid}`
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
    const pcap_uuid = req.pcap.uuid;
    const {withMongo} = argumentsToCmd();

    const streamPreProcessorCommand = `"${program.cpp}/stream_pre_processor" "${req.file.path}" ${pcap_uuid} ${withMongo}`;

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

    logger('stream-pre-processor').info(`Command: ${streamPreProcessorCommand}`);
    exec(streamPreProcessorCommand)
        .then((output) => {
            logger('stream-pre-process').info(output.stdout);
            logger('stream-pre-process').info(output.stderr);

            return Pcap.findOneAndUpdate({id: pcap_uuid},
                {
                    file_name: req.file.originalname,
                    pcap_file_name: req.file.filename,
                    owner_id: userID,
                    generated_from_network: req.pcap.from_network ? true : false
                },
                {new: true}).exec();
        })
        .then((data) => {
            websocketManager.instance().sendEventToUser(userID, {
                event: "PCAP_FILE_PROCESSED",
                data: Object.assign({}, data._doc, { progress: 66 })
            });

            next();
        })
        .catch((output) => {
            logger('pcap-pre-processing').error(`exception: ${output} ${output.stdout}`);
            logger('pcap-pre-processing').error(`exception: ${output} ${output.stderr}`);
        });
}

function pcapFullAnalysis(req, res, next) {
    const pcap_uuid = req.pcap.uuid;
    const pcap_folder = req.pcap.folder;

    const {withMongo, withInflux} = argumentsToCmd();

    const st2110ExtractorCommand =
        `"${program.cpp}/st2110_extractor" ${pcap_uuid} "${req.file.path}" "${pcap_folder}" ${withInflux} ${withMongo}`;


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

function singleStreamAnalysis(req, res, next) {
    const { streamID } = req.params;

    const pcap_uuid = req.pcap.uuid;
    const pcap_folder = req.pcap.folder;
    const pcap_location = req.file.path;

    const {withMongo, withInflux} = argumentsToCmd();

    const st2110ExtractorCommand =
        `"${program.cpp}/st2110_extractor" ${pcap_uuid} "${pcap_location}" "${pcap_folder}" ${withInflux} ${withMongo} -s "${streamID}"`;

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

function audioConsolidation(req, res, next) {
    const pcap_uuid = req.pcap.uuid;

    // post-process every audio stream for delay analysis
    Stream.find({pcap: pcap_uuid, media_type: "audio" }).exec()
        .then(streams => {
            let influx_promises = [];
            streams.forEach(stream => {
                influx_promises.push(influxDbManager.getAudioTimeStampedDelayFactorAmp(pcap_uuid, stream.id));
                influx_promises.push(Stream.findOne({id: stream.id}));
            });
            return Promise.all(influx_promises);
        })
        .then(values => {
            let mongo_promises = [];
            // values = [ [influx1], stream1, [influx2], stream2, ... ]
            for (let i = 0; i < values.length; i+=2) {
                let tsdf_max, res;
                if (values[i] == false) res = 'undefined';
                else tsdf_max = values[i][0].max;

                const stream = values[i+1];
                if (! stream.media_specific) continue; // can't do anything without associated stream
                const packet_time = stream.media_specific.packet_time * 1000; // usec

                // determine compliance based on EBU's recommendation
                if (tsdf_max < packet_time) res = 'narrow';
                else if (tsdf_max > 17 * packet_time) res = 'not_compliant';
                else if (! tsdf_max) res = 'undefined';
                else res = 'wide';

                mongo_promises.push(Stream.findOneAndUpdate({id: stream.id},
                    {global_audio_analysis: { tsdf_max: tsdf_max, tsdf_compliance: res }}, {new: true}));
            }
            return Promise.all(mongo_promises);
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
    const pcap_uuid = req.pcap.uuid;

    Pcap.findOne({id: pcap_uuid}).exec() // it returns the mongo db record of the PCAP
        .then(pcap_data => {
            // Everything is done, we must notify the GUI
            websocketManager.instance().sendEventToUser(userID, {
                event: "DONE",
                data: Object.assign({}, pcap_data._doc, { progress: 100 })
            });
        })
}

module.exports = {
    getUserFolder,
    generateRandomPcapFilename,
    generateRandomPcapDefinition,
    pcapIngest: [pcapFileAvailableFromReq, pcapPreProcessing, pcapFullAnalysis, audioConsolidation, pcapIngestEnd],
    pcapSingleStreamIngest: [pcapFileAvailableFromReq, singleStreamAnalysis, audioConsolidation]
};
