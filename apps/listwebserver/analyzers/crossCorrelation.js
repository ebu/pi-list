const path = require('path');
const fs = require('fs');
const util = require('util');
const { Xcorr } = require('abr-xcorr')
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const readFile = util.promisify(fs.readFile);
const logger = require('../util/logger');
const CONSTANTS = require('../enums/constants');

const getAudioBuffer = async (folder, channel, media_specific) => {
    const outputFormat = 's16le'
    const inputFile = `${folder}/raw`;
    const outputFile = `${folder}/${outputFormat}_${channel}ch.raw`;
    const encodingBits = media_specific.encoding == 'L24' ? 24 : 16;
    const sampling = parseInt(media_specific.sampling) / 1000;
    const channelNumber = media_specific.number_channels;
    const readFileAsync = util.promisify(fs.readFile);

    const ffmpegCommand = `ffmpeg -hide_banner -y -f s${encodingBits}be -ar ${sampling}k -ac ${channelNumber} -i "${inputFile}" -map_channel 0.0.${parseInt(channel)-1} -f ${outputFormat} -acodec pcm_${outputFormat} "${outputFile}"`;

    try {
        const output = await exec(ffmpegCommand);
        logger('cross-correlation').info(output.stdout);
        logger('cross-correlation').info(output.stderr);
        return await fs.readFileSync(outputFile);
    } catch (err) {
        logger('cross-correlation').error(err.stdout);
        logger('cross-correlation').error(err.stderr);
    };
}

const getAudioBuffers = async (config) => {
    var promises = [];
    const refDir = `${config.user_folder}/${config.reference.pcap}/${config.reference.stream}`;
    const mainDir = `${config.user_folder}/${config.main.pcap}/${config.main.stream}`;

    promises.push(getAudioBuffer(refDir, config.reference.channel, config.media_specific));
    promises.push(getAudioBuffer(mainDir, config.main.channel, config.media_specific));

    return await Promise.all(promises);
}

const createComparator = async (config) => {
    var buffers = await getAudioBuffers(config);

    // 1st pass
    const bufLength = Math.min(buffers[0].length, buffers[1].length);
    buffers[0] = buffers[0].slice(0, bufLength);
    buffers[1] = buffers[1].slice(0, bufLength);
    var xcorrRaw = Xcorr(buffers[1], buffers[0]); // main as 1 param

    // 2nd pass: keep overlapping samples and set everything to 0
    const n = Math.abs(xcorrRaw.iMax) * 2;
    if (xcorrRaw.iMax > 0)
    {
        buffers[0] = Buffer.concat([buffers[0].slice(0, bufLength-n), Buffer(Array.from(Array(n), ()=>0))]);
        buffers[1] = Buffer.concat([Buffer(Array.from(Array(n), ()=>0)), buffers[1].slice(n, bufLength)]);
        xcorrRaw = Xcorr(buffers[1], buffers[0]);
    }
    else if (xcorrRaw.iMax < 0)
    {
        buffers[0] = Buffer.concat([Buffer(Array.from(Array(n), ()=>0)), buffers[0].slice(n, bufLength)]);
        buffers[1] = Buffer.concat([buffers[1].slice(0, bufLength-n), Buffer(Array.from(Array(n), ()=>0))]);
        xcorrRaw = Xcorr(buffers[1], buffers[0]);
    }


    // because of padding, xcorrRaw.xcorr.length == 1.366 * bufLength!!!
    const l = xcorrRaw.xcorr.length; // even
    // 1st mesasure corresponds to a 0-shift and last is -1, [0, ..., l/2, -l/2, ..., -1]
    // so let's reorder to [-l/2, ..., 0, ..., l/2]
    const xcorrIndex = Array.from(Array(l).keys()).map(v => v - l/2 + 1);
    const xcorrReorder = Array.from(xcorrRaw.xcorr).slice(l/2, l).concat(Array.from(xcorrRaw.xcorr).slice(0, l/2));
    // xcorrRaw.iMax == 0 should be in the middle
    const iMax = xcorrRaw.iMax + l/2;

    // define and clip a window for graph
    const windowHalfWidth = 200;
    const windowMin = (iMax - windowHalfWidth) > 0? iMax - windowHalfWidth : 0;
    const windowMax = (iMax + windowHalfWidth) < l? iMax + windowHalfWidth : l;
    const xcorrWindow = Array.from(xcorrReorder).slice(windowMin, windowMax);

    // adjust timings
    const captureDelay = (config.main.first_packet_ts - config.reference.first_packet_ts) / 1000; //us
    const timeDelay = xcorrRaw.iMax / parseInt(config.media_specific.sampling) * 1000000; // us

    logger('audio-xcorr:').info(`len: buf=${bufLength}, xcorr=${l}`)
    logger('audio-xcorr:').info(`len: reorder=${xcorrReorder.length}, index=${xcorrIndex.length}, win=${xcorrWindow.length}`)
    logger('audio-xcorr:').info(`max index: rel=${xcorrRaw.iMax}, abs=${iMax}`)
    logger('audio-xcorr:').info(`max value: given=${xcorrRaw.xcorrMax}, guessed=${xcorrReorder[iMax]}`)
    logger('audio-xcorr:').info(`win: [${windowMin}, ${windowMax}]`)

    //TODO Get RTP TS delta

    return {
        xcorr: {
            max: xcorrRaw.xcorrMax,
            raw: xcorrWindow,
            index: xcorrIndex[windowMin],
        },
        delay: {
            sample: xcorrRaw.iMax,
            time: timeDelay,
            capture: captureDelay,
            actual: (timeDelay + captureDelay),
        },
        transparency: xcorrRaw.xcorrMax > 0.99,
    };
};

module.exports = {
    createComparator,
};
