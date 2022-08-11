import { api } from '@bisect/ebu-list-sdk';
import loggerFactory from '../../util/logger';
import * as express from 'express';
import { IPcapReq } from './index';
import { mq } from '@bisect/bisect-core-ts-be';
import Pcap from '../../models/pcap';
import { v4 as uuid } from 'uuid';
const program = require('../programArguments');

const logger = loggerFactory('stream-pre-processor');
const preprocessorRequestSender = mq.createQueueSender(program.rabbitmqUrl, api.mq.queues.preprocessorRequest);

export const outstandingPreprocessorRequests: { [key: string]: any } = {};

export async function pcapPreProcessing(req: IPcapReq, res: express.Response, next: express.NextFunction) {
    const pcapId = req.pcap?.uuid;
    logger.info(`Pcap ID: ${pcapId}`);

    if (!pcapId) {
        next('No pcap ID in the request');
        return;
    }

    const data: api.pcap.IPcapInfo | null = await Pcap.findOne({
        id: pcapId,
    }).exec();

    outstandingPreprocessorRequests[pcapId] = {
        req,
        res,
        next,
    };

    const request: api.mq.IPreprocessorRequest = {
        options: {
            transport_type: data?.transport_type ?? 'RTP',
            media_type_map: data?.media_type_map,
        },
        action: 'preprocessing.request',
        workflow_id: uuid(),
        pcap_id: pcapId,
        pcap_path: res.locals.pcapFilePath,
    };

    preprocessorRequestSender.send({
        msg: request,
        persistent: mq.persistent,
    });
}
