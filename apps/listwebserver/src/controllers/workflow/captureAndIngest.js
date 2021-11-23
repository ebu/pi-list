import { api } from '@bisect/ebu-list-sdk';
import { mq } from '@bisect/bisect-core-ts-be';
const programArguments = require('../../util/programArguments');
const liveSources = require('../live/sources');
const websocketManager = require('../../managers/websocket');

const createWorkflow = async (wf, inputConfig, workSender) => {
    const wantedSenderIds = inputConfig.ids;
    const wantedSenders = await liveSources.findLiveSources(wantedSenderIds);

    const userID = wf.meta.createdBy;
    const name = inputConfig.name;
    var compareConfig;
    var workflowResponse = {
        id: wf.id,
        date: Date.now(),
        msg: '',
    };

    const outputConfiguration = {
        id: wf.id,
        url: programArguments.webappDomain,
        authorization: inputConfig.authorization,
        senders: wantedSenders,
        filename: inputConfig.filename,
        durationMs: inputConfig.durationMs,
    };

    wf.configuration = outputConfiguration;

    await workSender.send({ msg: wf, persistent: mq.persistent });

    workflowResponse.msg = `${name}: success`;
    websocketManager.instance().sendEventToUser(userID, {
        event: api.wsEvents.Pcap.capturing,
        data: workflowResponse,
    });
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
