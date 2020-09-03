const workflows = require('../../../../js/common/workflows/types');
const mqtypes = require('../../../../js/common/mq/types');
const programArguments = require('../../util/programArguments');
const liveSources = require('../live/sources');
const { persistent } = require('../../../../js/common_server/mq/send');

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
        key: mqtypes.exchanges.mqtt.topics.workflows.cancel,
        msg: payload,
    });
};

module.exports = {
    createWorkflow,
    cancelWorkflow,
};
