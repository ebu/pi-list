const _ = require('lodash');
const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
const constants = require('../enums/analysis');
const CONSTANTS = require('../enums/constants');
const fs = require('../util/filesystem');
const logger = require('../util/logger');
const { appendError, validateMulticastAddresses } = require('./utils');
const {
    doRtpTicksAnalysis,
    validateRtpTicks,
    doRtpTsAnalysis,
    validateRtpTs,
    doInterFrameRtpTsDeltaAnalysis,
    validateInterFrameRtpTsDelta,
} = require('./rtp');

const get_rtp_validation = (stream) => {
    // TODO get from a validation template
    const validation = {
        rtp: {
            // See docs/video_timing_analysis.md
            deltaRtpTsVsNtLimit: {
                min: -1,
                max: 0,
            },
            deltaPktTsVsRtpTsLimit: {
                min: 0,
                max: 1000000,
            },
        },
    };

    const v = _.cloneDeep(validation);
    const tro_default = stream.media_specific.tro_default_ns / 1000000000;
    const max_ticks_offset = tro_default * 90000;
    v.rtp.deltaRtpTsVsNtLimit.max = Math.ceil(max_ticks_offset) + 1;
    return v;
};

// Sets analyses.2110_21_cinst.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function map2110d21Cinst(stream) {
    const compliance = _.get(stream, 'global_video_analysis.cinst.compliance');

    if (compliance === constants.outcome.not_compliant) {
        stream = _.set(stream, 'analyses.2110_21_cinst.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.cinst_above_maximum,
        });
    } else {
        stream = _.set(stream, 'analyses.2110_21_cinst.result', constants.outcome.compliant);
    }

    return stream;
}

// Sets analyses.2110_21_vrx.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function map2110d21Vrx(stream) {
    const compliance = _.get(stream, 'global_video_analysis.vrx.compliance');

    if (compliance === constants.outcome.not_compliant) {
        stream = _.set(stream, 'analyses.2110_21_vrx.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.vrx_above_maximum,
        });
    } else {
        stream = _.set(stream, 'analyses.2110_21_vrx.result', constants.outcome.compliant);
    }

    return stream;
}

// Returns one promise, which result is undefined.
const doVideoStreamAnalysis = async (pcapId, stream) => {
    await doRtpTicksAnalysis(pcapId, stream);
    const rtp_validation = get_rtp_validation(stream);
    await validateRtpTicks(stream, rtp_validation);
    await doRtpTsAnalysis(pcapId, stream);
    await validateRtpTs(stream, rtp_validation);
    await doInterFrameRtpTsDeltaAnalysis(pcapId, stream);
    await validateInterFrameRtpTsDelta(stream);
    await map2110d21Cinst(stream);
    await map2110d21Vrx(stream);
    await validateMulticastAddresses(stream);
    return await Stream.findOneAndUpdate({ id: stream.id }, stream, {
        new: true,
    });
};

// Returns one array with a promise for each stream. The result of the promise is undefined.
function doVideoAnalysis(pcapId, streams) {
    const promises = streams.map((stream) => doVideoStreamAnalysis(pcapId, stream));
    return Promise.all(promises);
}

const generateThumbail = async (path, size) => {
    if (! fs.folderExists(`${path}`)) {
        return;
    }

    png = `${path}/${CONSTANTS.PNG_FILE}`;
    jpg = `${path}/${CONSTANTS.JPG_FILE}`;
    ffmpegCommand = `ffmpeg -hide_banner -f image2 -i ${png} -vf scale=${size} ${jpg}`;
    logger('video').info(`Create thumbnails: ${ffmpegCommand}`);
    return await exec(ffmpegCommand);
}

function generateThumbails(folder, streams){
    /* downsize original png to 240-px-width jpg */
    const promises = streams.map(async (stream) => {
        fs.getAllFirstLevelFolders(`${folder}/${stream.id}`)
            .map(async (frame) => generateThumbail(`${folder}/${stream.id}/${frame.id}`, '240:-1'));
        });
    return Promise.all(promises);
}

module.exports = {
    doVideoAnalysis,
    generateThumbails,
};
