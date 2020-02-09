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
    const minLength = Math.min(buffers[0].length, buffers[1].length);
    buffers[0] = buffers[0].slice(0,minLength);
    buffers[1] = buffers[1].slice(0,minLength);

    const xcorrRaw = Xcorr(buffers[1], buffers[0]); // main as 1 param

    // window the result
    const windowWidth = 250;
    const windowMin = xcorrRaw.iMax > windowWidth? xcorrRaw.iMax - windowWidth : 0;
    const windowMax = (xcorrRaw.iMax + windowWidth) < 2 * minLength? xcorrRaw.iMax + windowWidth : 2 * minLength;
    const xcorr = Array.from(xcorrRaw.xcorr).slice(windowMin, windowMax);
    const captureDelay = (config.main.first_packet_ts - config.reference.first_packet_ts) /1000000; //ms
    const timeDelay = xcorrRaw.iMax / parseInt(config.media_specific.sampling) * 1000; // ms
    //console.log(xcorr.map((e,i) => {return {value: e, index: windowMin+i};} ))

    return {
        xcorr: {
            max: xcorrRaw.xcorrMax,
            raw: xcorr.map((e,i) => {return {value: e, index: windowMin+i};})
        },
        delay: {
            sample: xcorrRaw.iMax,
            time: timeDelay,
            capture: captureDelay,
            actual: timeDelay + captureDelay,
        }
    };
};

module.exports = {
    createComparator,
};
