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
        cookies: inputConfig.cookies,
        senders: wantedSenders,
        filename: inputConfig.filename,
    };

    wf.configuration = outputConfiguration;

    const msg = {
        type: wf.type,
        configuration: wf.configuration,
    };

    await workSender.send({ msg, persistent });
};

module.exports = {
    createWorkflow,
};
