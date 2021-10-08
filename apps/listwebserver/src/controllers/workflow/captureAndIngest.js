import { api } from '@bisect/ebu-list-sdk';
const programArguments = require('../../util/programArguments');
const liveSources = require('../live/sources');
const { persistent } = require('../../util/mq/send');

const createWorkflow = async (wf, inputConfig, workSender) => {
    const wantedSenderIds = inputConfig.ids;
    const wantedSenders = await liveSources.findLiveSources(wantedSenderIds);

    const outputConfiguration = {
        id: wf.id,
        ingestPutUrl: `${programArguments.apiUrl}/pcap`,
        authorization: inputConfig.authorization,
        senders: wantedSenders,
        filename: inputConfig.filename,
        durationMs: inputConfig.durationMs,
    };

    wf.configuration = outputConfiguration;

    await workSender.send({ msg: wf, persistent });
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
