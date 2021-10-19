import { api } from '@bisect/ebu-list-sdk';
import Stream from '../models/stream';
const websocketManager = require('../managers/websocket');
// import websocketManager from '../managers/websocket';
const middleware = require('../auth/middleware');
// import middleware from '../auth/middleware';
import { getUserFolder, runAnalysis } from '../util/analysis';
import Pcap from '../models/pcap';
import path from 'path';
import { IStreamInfo } from '@bisect/ebu-list-sdk/dist/types';
import loggerFactory from '../util/logger';

const logger = loggerFactory('streams');

const activeExtractions = new Set();

export async function verifyIfFramesAreExtractedOrExtract(req: any) {
    const pcapId = req.params.pcapID;
    const pcap = await Pcap.findOne({ id: pcapId }).exec();

    const userId = middleware.getUserId(req);
    const streamID = req.params.streamID;
    const pcapFolder: string = `${getUserFolder(req)}/${pcapId}`;
    const analysisProfile = path.join(pcapFolder, 'profile.json');
    const pcapFile = `${pcapFolder}/${pcap.pcap_file_name}`;
    const extractFrames = true;

    const params = {
        pcapId: pcapId,
        pcapFolder: pcapFolder,
        pcapFile: pcapFile,
        streamID: streamID,
        userId: userId,
        analysisProfileFile: analysisProfile,
        extractFrames: extractFrames,
    };

    const stream = (await Stream.findOne({ id: streamID })) as IStreamInfo | null;

    if (stream === null) {
        logger.error(`${streamID} not found`);
        websocketManager.instance().sendEventToUser(userId, {
            event: 'EXTRACT_FRAMES_FAILED',
            data: streamID,
        });
        return;
    }

    if (stream.processing?.extractedFrames === api.pcap.ProcessingState.completed) {
        websocketManager.instance().sendEventToUser(userId, {
            event: 'EXTRACT_FRAMES_COMPLETED',
            data: streamID,
        });
        return;
    }

    if (activeExtractions.has(streamID)) {
        websocketManager.instance().sendEventToUser(userId, {
            event: 'EXTRACT_FRAMES_ACTIVE',
            data: streamID,
        });
        return;
    }

    activeExtractions.add(streamID);

    await runAnalysis(params);

    if (stream.processing === undefined) {
        stream.processing = { extractedFrames: api.pcap.ProcessingState.completed };
    } else {
        stream.processing.extractedFrames = api.pcap.ProcessingState.completed;
    }

    websocketManager.instance().sendEventToUser(userId, {
        event: 'EXTRACT_FRAMES_COMPLETED',
        data: streamID,
    });

    await Stream.findOneAndUpdate({ id: stream.id }, stream, {
        new: true,
        overwrite: true,
    }).exec();

    activeExtractions.delete(streamID);
}
