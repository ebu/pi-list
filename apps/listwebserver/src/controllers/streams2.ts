import { api } from '@bisect/ebu-list-sdk';
import Stream from '../models/stream';
const websocketManager = require('../managers/websocket');
const { getUserId } = require('../auth/middleware');
import { runAnalysis } from '../util/analysis';
import Pcap from '../models/pcap';
import path from 'path';
import { IStreamInfo } from '@bisect/ebu-list-sdk/dist/types';
import loggerFactory from '../util/logger';
import { getPcapFolder } from '../util/analysis/utils';

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

    const stream = (await Stream.findOne({ id: streamId })) as IStreamInfo | null;

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
