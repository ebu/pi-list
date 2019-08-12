const workflows = require('../../../../js/common/workflows/types');
const programArguments = require('../../util/programArguments');
const liveSources = require('../live/sources');
const { persistent } = require('../../../../js/common_server/mq/send');

const createWorkflow = async (wf, inputConfig, workSender) => {
    const wantedSenderIds = inputConfig.ids;
    const wantedSenders = await liveSources.findLiveSources(wantedSenderIds);

    const outputConfiguration = {
        id: wf.id,
        ingestPutUrl: `${programArguments.apiUrl}/pcap`,
        cookie: inputConfig.cookie,
        senders: wantedSenders,
        filename: inputConfig.filename,
        durationMs: inputConfig.durationMs,
    };

    wf.configuration = outputConfiguration;

    await workSender.send({ msg: wf, persistent });
};

module.exports = {
    createWorkflow,
};
