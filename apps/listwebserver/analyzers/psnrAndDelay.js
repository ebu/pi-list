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

const getPnsrAndDelay = async (index, mainPath, refFrame) => {
    const psnrFile = `${mainPath}/psnr.log`;
    const ffmpegCommand = `ffmpeg -hide_banner -i ${mainPath}/frame.png -i ${refFrame.path}/frame.png -lavfi psnr=\"stats_file=${psnrFile}\" -f null -`;

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


    return {
        psnr: psnr === 'inf'? 'inf' : parseFloat(psnr),
        index: index,
    };
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

const getPsnrList = async (mainDirList, refFrameInfo) => {
    logger('psnr-delay').info(`Compare ${mainDirList.length} frames of main sequence with frame #${refFrameInfo.index} of reference sequence.`);

    const getPsnrPromises = mainDirList.map(
        async (path, index) => getPnsrAndDelay(
            index,
            path,
            refFrameInfo
        )
    );
    return Promise.all(getPsnrPromises);
};

const getPsnrMax = async (psnrList) => {
    return await psnrList.reduce((max, e) =>
            max.psnr === 'inf'? max :
                e.psnr === 'inf' ? e :
                    e.psnr > max.psnr ? e :
                        max,
            psnrList[0]
        );
}

const createComparator = async (config) => {
    const refDirList = await getFrameDirList(`${config.user_folder}/${config.reference.pcap}/${config.reference.stream}`);
    const mainDirList = await getFrameDirList(`${config.user_folder}/${config.main.pcap}/${config.main.stream}`);

    // get the frame in the middle of the reference sequence and all the usefull timing info
    const refDirIndex = Math.floor(refDirList.length / 2);
    const refFrame = await getFrameInfo(refDirList[refDirIndex], refDirIndex);

    // compare this middle `reference` frame with all the frames of
    // `main` sequence and return all PSNR
    const psnrList = await getPsnrList(mainDirList, refFrame);
    // search for the max which corresponds to the `mainFrame` which is
    // the most similar to `refFrame`
    const psnrMax = await getPsnrMax(psnrList);
    const mainFrame = await getFrameInfo(mainDirList[psnrMax.index], psnrMax.index);

    const delay = {
        sample: psnrMax.index - refFrame.index,
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
