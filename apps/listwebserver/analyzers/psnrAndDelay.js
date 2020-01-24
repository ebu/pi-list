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
        path: mainPath,
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

    const pktList = await getTsFromPacketFile(framePath);
    const pktOffsetList = await Array.from(pktList, e => {
            return {
                packet_time: e.packet_time,
                offset: {
                    lines: e.lines[0].line_number,
                    pixels: e.lines[0].offset
                }
            };
        });

    return {
        frameInfo: {
            index: index,
            path: framePath,
            rtp_ts: frameTs.timestamp,
            first_packet_ts: frameTs.first_packet_ts,
            last_packet_ts: frameTs.last_packet_ts,
        },
        framePktOffsetList: pktOffsetList
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

const getPktDistanceList = async (first_packet_ts, frame) => {
    return await frame.framePktOffsetList.map(e => Math.abs(first_packet_ts - e.packet_time));
}

const getMin = async (list) => {
    const min = Math.min(...list);
    return { min: min, index: list.indexOf(min) }
};

const createComparator = async (config) => {
    // TODO: rewrite all of this with without await
    const refDirList = await getFrameDirList(`${config.user_folder}/${config.reference.pcap}/${config.reference.stream}`);
    const mainDirList = await getFrameDirList(`${config.user_folder}/${config.main.pcap}/${config.main.stream}`);

    // get the frame in the middle of the reference sequence and all the usefull timing info
    const refDirIndex = Math.floor(refDirList.length / 2);
    const refFrame = await getFrameInfo(refDirList[refDirIndex], refDirIndex);

    // compare this middle `reference` frame with all the frames of
    // `main` sequence and return all PSNR
    const psnrList = await getPsnrList(mainDirList, refFrame.frameInfo);
    // search for the max which corresponds to the `mainFrame` which is
    // the most similar to `refFrame`
    const psnrMax = await getPsnrMax(psnrList);
    const mainFrame = await getFrameInfo(mainDirList[psnrMax.index], psnrMax.index)

    const delta = {
        delta_index: psnrMax.index - refFrame.frameInfo.index,
        delta_rtp_ts: mainFrame.frameInfo.rtp_ts - refFrame.frameInfo.rtp_ts,
        delta_first_pkt_ts: mainFrame.frameInfo.first_packet_ts - refFrame.frameInfo.first_packet_ts,
    }

    // At this point, we still miss time precision in media units, i.e.
    // lines & pixels.  So let's measure the delta between `mainFrame`
    // and the `reference` frame which arrives at the same moment. This
    // `syncFrame` can be either at the same index as `mainFrame` OR at
    // index-1. To determine that, find the pkt inside these two
    // candidates the closest to the 1st pkt of `mainFrame` and read
    // assoicated line & pixel offset.
    const syncFrameIndex1 = mainFrame.frameInfo.index - 1;
    const syncFrame1 = await getFrameInfo(refDirList[syncFrameIndex1], syncFrameIndex1);
    const pktDistanceList1 = await getPktDistanceList(mainFrame.frameInfo.first_packet_ts, syncFrame1);
    const pktDistanceMin1 = await getMin(pktDistanceList1);

    const syncFrameIndex2 = mainFrame.frameInfo.index;
    const syncFrame2 = await getFrameInfo(refDirList[syncFrameIndex2], syncFrameIndex2);
    const pktDistanceList2 = await getPktDistanceList(mainFrame.frameInfo.first_packet_ts, syncFrame2);
    const pktDistanceMin2 = await getMin(pktDistanceList2);

    const firstSyncFrame = (pktDistanceMin1.min < pktDistanceMin2.min);
    const syncFrame = firstSyncFrame? syncFrame1 : syncFrame2;
    const pktDistanceMin = firstSyncFrame? pktDistanceMin1 : pktDistanceMin2;
    var offset = syncFrame.framePktOffsetList[pktDistanceMin.index].offset;
    // if `reference` is after `main`, then invert offset
    if (delta.delta_first_pkt_ts < 0) {
        const lastOffset = syncFrame.framePktOffsetList[syncFrame.framePktOffsetList.length - 1].offset;
        offset.lines -= lastOffset.lines;
        offset.pixels = 0; // forget about it
        if (!firstSyncFrame) {
            delta.delta_index += 1;
        }
    }
    else {
        if (firstSyncFrame) {
            delta.delta_index -= 1;
        }
    }

    console.log(`ref frame: ${JSON.stringify(refFrame.frameInfo)}`)
    console.log(`main frame: ${JSON.stringify(mainFrame.frameInfo)}`)
    console.log(`deltas : ${JSON.stringify(delta)}`);
    console.log(`sync1 frame: ${JSON.stringify(syncFrame1.frameInfo)}`)
    console.log(`     ${JSON.stringify(pktDistanceMin1)}`);
    console.log(`     ${JSON.stringify(syncFrame1.framePktOffsetList[pktDistanceMin1.index])}`);
    console.log(`sync2 frame: ${JSON.stringify(syncFrame2.frameInfo)}`)
    console.log(`     ${JSON.stringify(pktDistanceMin2)}`);
    console.log(`     ${JSON.stringify(syncFrame2.framePktOffsetList[pktDistanceMin2.index])}`);
    console.log(`offset: ${JSON.stringify(offset)}`)

    return { psnr: psnrList, max: { ...delta, ...psnrMax, ...offset } };
};

module.exports = {
    createComparator,
};
