import {
    api
} from '@bisect/ebu-list-sdk';
import {
    mq
} from '@bisect/bisect-core-ts-be';
const programArguments = require('../../util/programArguments');
const liveSources = require('../live/sources');
const websocketManager = require('../../managers/websocket');

const msPeriod = 200;

const captureTick = (msCounter, durationMs, handler) => {
    const newMsCounter = msCounter + msPeriod;
    if (newMsCounter > durationMs) {
        return;
    }
    handler(newMsCounter / durationMs * 100);
    setTimeout(captureTick, msPeriod, newMsCounter, durationMs, handler);
}

const createWorkflow = async (wf, inputConfig, workSender) => {
    const wantedSenderIds = inputConfig.ids;
    const wantedSenders = await liveSources.findLiveSources(wantedSenderIds);
    const userID = wf.meta.createdBy;

    const outputConfiguration = {
        id: wf.id,
        url: programArguments.webappDomain,
        authorization: inputConfig.authorization,
        senders: wantedSenders,
        filename: inputConfig.filename,
        durationMs: inputConfig.durationMs,
    };

    wf.configuration = outputConfiguration;

    await workSender.send({
        msg: wf,
        persistent: mq.persistent
    });

    const sendWorkflowProgress = (progress) => {
        const workflowResponse = {
            id: 'dummy',
            file_name: inputConfig.filename,
            progress: progress,
        };
        websocketManager.instance().sendEventToUser(userID, {
            event: api.wsEvents.Pcap.capturing,
            data: workflowResponse,
        });
    };
    setTimeout(captureTick, msPeriod, 0, inputConfig.durationMs + 2000, sendWorkflowProgress); // 2sec of workflow overhead
};

const cancelWorkflow = async (payload, mqttSender) => {
    await mqttSender.send({
        key: api.mq.exchanges.mqtt.topics.workflows.cancel,
        msg: payload,
    });
};

module.exports = {
    createWorkflow,
    cancelWorkflow,
};