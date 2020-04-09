const path = require('path');
const fs = require('fs');
const util = require('util');
const glob = util.promisify(require('glob'));
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const readFile = util.promisify(fs.readFile);
const logger = require('../util/logger');
const CONSTANTS = require('../enums/constants');

const getTsFromMetaFile = async (path) => {
    return  JSON.parse(await readFile(`${path}/${CONSTANTS.META_FILE}`, 'utf8'));
}

const getTsFromPacketFile = async (path) => {
    return  JSON.parse(await readFile(`${path}/${CONSTANTS.PACKET_FILE}`, 'utf8'));
}

const getPnsr = async (mainPath, refPath) => {
    const psnrFile = `${mainPath}/psnr.log`;
    const ffmpegCommand = `ffmpeg -hide_banner -i ${mainPath}/frame.png -i ${refPath}/frame.png -lavfi psnr=\"stats_file=${psnrFile}\" -f null -`;

    try {
        output = await exec(ffmpegCommand);
    } catch (err) {
        logger('psnr-delay').error(err.stdout);
        logger('psnr-delay').error(err.stderr);
    };

    /*
     * get 'psnr_avg' field in ffmpeg report file:
     * "n:1 mse_avg:5.23 mse_r:7.50 mse_g:6.24 mse_b:7.16 mse_a:0.00 psnr_avg:40.95 psnr_r:39.38 psnr_g:40.18 psnr_b:39.58 psnr_a:inf"
     */
    const psnrText = await readFile(psnrFile, 'utf8');
    const psnr = psnrText.split(' ')
        .map(line => line.split(':'))
        .filter(line => line[0] === 'psnr_avg')[0][1];


    return psnr === 'inf'? 'inf' : parseFloat(psnr);
}

// collect all the dirs with frame.png inside
const getFrameDirList = async (dir) => {
    const pattern = `${dir}/**/*.png`;
    const files = await glob(pattern);
    return await files.map(file => path.dirname(file));
}

// get both meta.json and packets.json file
const getFrameInfo = async (framePath, index) => {
    const frameTs = await getTsFromMetaFile(framePath);

    return {
        index: index,
        path: framePath,
        rtp_ts: frameTs.timestamp,
        first_packet_ts: frameTs.first_packet_ts,
        last_packet_ts: frameTs.last_packet_ts,
    };
}

const getPsnrList = async (mainDirList, refDirList) => {

    const getPsnrPromises = mainDirList.map(
        async (path, index) => getPnsr(
            path,
            refDirList[index]
        )
    );
    return Promise.all(getPsnrPromises);
};

const getPsnrMax = async (psnrList) => {
    const max = await psnrList.reduce((max, e) =>
            max === 'inf'? max :
                e === 'inf' ? e :
                    e > max ? e : max,
            psnrList[0]
        );

    return {psnr: max, index: psnrList.findIndex(e => e == max)}
}

const getPsnrAvg = async (psnrList) => {
    const sum = await psnrList.reduce((acc, e) => acc += e, 0);
    return sum / psnrList.length;
}

const getPsnrInfCounter = async (psnrList) => {
    return await psnrList.reduce((counter, e) => counter + (e === 'inf'? 1 : 0), 0);
}

const createComparator = async (config) => {
    var refDirList = await getFrameDirList(`${config.user_folder}/${config.reference.pcap}/${config.reference.stream}`);
    var mainDirList = await getFrameDirList(`${config.user_folder}/${config.main.pcap}/${config.main.stream}`);

    // get the frame in the middle of the reference sequence, frame info
    // and create a fake list full of it
    const refDirIndex = Math.floor(refDirList.length / 2);
    logger('psnr-delay').info(`Compare ${mainDirList.length} frames of main sequence with frame #${refDirIndex} of reference sequence.`);
    const refFrame = await getFrameInfo(refDirList[refDirIndex], refDirIndex);
    const fakeRefDirList = Array.from(Array(mainDirList.length), () => refDirList[refDirIndex]);

    // compare this middle `reference` frame with all the frames of
    // `main` sequence and return all PSNR
    const psnrList = await getPsnrList(mainDirList, fakeRefDirList);
    // search for the max which corresponds to the `mainFrame` which is
    // the most similar to `refFrame`
    var psnrMax = await getPsnrMax(psnrList);
    const mainFrame = await getFrameInfo(mainDirList[psnrMax.index], psnrMax.index);
    const deltaIndex = psnrMax.index - refFrame.index;

    // Now let's calculate the PSNR over the full shifted sequences
    // but first, strip the sequences:
    // * remove 1st and last frames which are likely to be incomplete
    // * remove the non-overlapping frames
    const clip = 1;
    if (deltaIndex >= 0) {
        mainDirList = mainDirList.slice(deltaIndex + clip, mainDirList.length - clip);
        refDirList = refDirList.slice(clip, mainDirList.length + clip);
    } else {
        refDirList = refDirList.slice(-deltaIndex + clip, refDirList.length - clip);
        mainDirList = mainDirList.slice(clip, refDirList.length + clip);
    }
    logger('psnr-delay').info(`Compare ${mainDirList.length} frames of main sequence with ${refDirList.length} frame reference sequence, one to one.`);
    const psnrMaxList = await getPsnrList(mainDirList, refDirList);

    // get the average
    if (psnrMax.psnr === 'inf') {
        if (await getPsnrInfCounter(psnrMaxList) !== psnrMaxList.length) {
            // replace 'inf' with real high but arbitrary value and get average
            const tmp = Array.from(psnrMaxList,
                e => e.psnr === 'inf'? {index:e.index, psnr: 100}: e);
            psnrMax.psnr = await getPsnrAvg(tmp);
        }
        // else, it's all 'inf' and let psnrMax unchanged
    } else {
        psnrMax.psnr = await getPsnrAvg(psnrMaxList);
    }

    const delay = {
        sample: deltaIndex,
        rtp: mainFrame.rtp_ts - refFrame.rtp_ts,
        actual: ((mainFrame.first_packet_ts - refFrame.first_packet_ts) +
                (mainFrame.last_packet_ts - refFrame.last_packet_ts)) /2
                / 1000, //us
    };

    // Convert actual delay into media units: frames, fields, lines and pixels
    const exactRate = eval(config.media_specific.rate);
    const interlaced = config.media_specific.scan_type === "interlaced";
    const exactHeigth = interlaced ? config.media_specific.height/2 : config.media_specific.height;
    const absDelay = Math.abs(delay.actual / 1000000); // in sec
    const frameDuration = 1.0 / exactRate;
    const lineDuration = frameDuration / exactHeigth;
    const pixelDuration = lineDuration / config.media_specific.width;

    // here frames may refer to fields
    var frames = Math.floor(absDelay / frameDuration);
    var remainder = absDelay % frameDuration;
    const lines = Math.floor(remainder / lineDuration);
    remainder = remainder % lineDuration;
    const pixels = Math.floor(remainder / pixelDuration);
    var fields = 0;
    if (interlaced) {
        frames = Math.floor(frames/2);
        fields = frames % 2;
    }
    const media = {
        sign: Math.sign(delay.actual),
        frames: frames,
        fields: fields,
        lines: lines,
        pixels: pixels
    };

    logger('psnr-delay').info(`${JSON.stringify(config)}`)
    logger('psnr-delay').info(`ref frame: ${JSON.stringify(refFrame)}`)
    logger('psnr-delay').info(`psnr max: ${JSON.stringify(psnrMax)}`)
    logger('psnr-delay').info(`main frame: ${JSON.stringify(mainFrame)}`)
    logger('psnr-delay').info(`delays : ${JSON.stringify(delay)}`);
    logger('psnr-delay').info(`media: ${JSON.stringify(media)}`)

    return {
        psnr: {
            raw: psnrList,
            max: psnrMax,
        },
        delay: {
            ... delay,
            ... media,
        },
        transparency: psnrMax.psnr === 'inf',
    };
};

module.exports = {
    createComparator,
};
