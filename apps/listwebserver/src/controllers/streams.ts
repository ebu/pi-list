const _ = require('lodash');
import Stream from '../models/stream';
const { updateStreamWithTsdfMax } = require('../analyzers/audio');
const { addRtpSequenceAnalysisToStream } = require('../analyzers/rtp');
import path from 'path';
import { api } from '@bisect/ebu-list-sdk';
const websocketManager = require('../managers/websocket');
const { getUserId } = require('../auth/middleware');
import { runAnalysis } from '../util/analysis';
import Pcap from '../models/pcap';
import loggerFactory from '../util/logger';
import { getPcapFolder } from '../util/analysis/utils';
import { getUserFolderFromUserId } from '../util/analysis/utils';
import { readFile } from 'fs/promises';
const CONSTANTS = require('../enums/constants');

const logger = loggerFactory('streams');

const activeExtractions = new Set();

export async function waitForFramesExtraction(userId: string, pcapId: string, streamId: string) {
    const pcap = await Pcap.findOne({ id: pcapId }).exec();
    const pcapFolder = getPcapFolder(userId, pcapId);
    const analysisProfile = path.join(pcapFolder, 'profile.json');
    const pcapFile = `${pcapFolder}/${pcap.pcap_file_name}`;
    const extractFrames = true;

    const params = {
        pcapId: pcapId,
        pcapFolder: pcapFolder,
        pcapFile: pcapFile,
        streamID: streamId,
        userId: userId,
        analysisProfileFile: analysisProfile,
        extractFrames: extractFrames,
    };

    const stream = (await Stream.findOne({ id: streamId })) as api.pcap.IStreamInfo | null;

    if (stream === null) {
        logger.error(`${streamId} not found`);
        websocketManager.instance().sendEventToUser(userId, {
            event: 'EXTRACT_FRAMES_FAILED',
            data: streamId,
        });
        return;
    }

    if (stream.processing?.extractedFrames === api.pcap.ProcessingState.completed) {
        websocketManager.instance().sendEventToUser(userId, {
            event: 'EXTRACT_FRAMES_COMPLETED',
            data: streamId,
        });
        return;
    }

    if (activeExtractions.has(streamId)) {
        websocketManager.instance().sendEventToUser(userId, {
            event: 'EXTRACT_FRAMES_ACTIVE',
            data: streamId,
        });
        return;
    }

    activeExtractions.add(streamId);

    await runAnalysis(params);

    if (stream.processing === undefined) {
        stream.processing = { extractedFrames: api.pcap.ProcessingState.completed };
    } else {
        stream.processing.extractedFrames = api.pcap.ProcessingState.completed;
    }

    websocketManager.instance().sendEventToUser(userId, {
        event: 'EXTRACT_FRAMES_COMPLETED',
        data: streamId,
    });

    await Stream.findOneAndUpdate({ id: stream.id }, stream, {
        new: true,
        overwrite: true,
    }).exec();

    activeExtractions.delete(streamId);
}

export async function verifyIfFramesAreExtractedOrExtract(req: any) {
    const userId = getUserId(req);
    const pcapId = req.params.pcapID;
    const streamId = req.params.streamID;
    return waitForFramesExtraction(userId, pcapId, streamId);
}

function upgradeTsdfAnalysis(stream: any) {
    const tsdfAnalysis = _.get(stream, ['analyses', 'tsdf']);
    if (tsdfAnalysis) return stream;

    const tsdfMax = _.get(stream, ['global_audio_analysis', 'tsdf_max']);
    return updateStreamWithTsdfMax(stream, tsdfMax);
}

function upgradeStreamInfo(stream: any) {
    if (!stream) return stream;

    if (stream.media_type == 'audio') {
        stream = upgradeTsdfAnalysis(stream);
    }
    stream = addRtpSequenceAnalysisToStream(stream);

    return stream;
}

export async function getStreamWithId(id: string) {
    const stream = await Stream.findOne({ id }).exec();
    return upgradeStreamInfo(stream);
}

export async function getStreamsForPcap(pcapId: string) {
    return Stream.find({ pcap: pcapId }).exec();
}

export function getPitFilePathForStream(userID: string, pcapID: string, streamID: string): string {
    const userFolder = getUserFolderFromUserId(userID);
    return path.join(userFolder, pcapID, streamID, CONSTANTS.PIT_FILE);
}

export async function getPitRangeForStream(
    userID: string,
    pcapID: string,
    streamID: string
): Promise<api.pcap.MinMaxAvgUsRange> {
    const pitPath = getPitFilePathForStream(userID, pcapID, streamID);
    const data = await readFile(pitPath);
    const p = JSON.parse(data.toString());
    return {
        min: p.min / 1000,
        max: p.max / 1000,
        avg: p.avg / 1000,
        unit: 'μs',
    };
}
