const logger = require('../util/logger');
import { mq } from '@bisect/bisect-core-ts-be';
import { api } from '@bisect/ebu-list-sdk';
const programArguments = require('../util/programArguments');

logger('probes-manager').info('Monitoring probes');

const announceReceiver = mq.createExchangeReceiver(programArguments.rabbitmqUrl, api.mq.exchanges.probeStatus, [
    api.mq.exchanges.probeStatus.keys.announce,
]);

const handleAnnounceMessage = (msg) => {
    try {
        const message = JSON.parse(msg.toString());
        const { id, status } = message;
        // logger('probes-manager').info(
        //     `Status update - ${msg.toString()}`
        // );
    } catch (err) {
        const message = `Error processing probe status update: ${err.message}`;
        logger('probes-manager').error(message);
    }
};

announceReceiver.emitter.on(mq.onMessageKey, handleAnnounceMessage);

const createManager = () => {
    return Promise.resolve({
        getProbes: () => [],
        close: () => {},
    });
};

module.exports = {
    createManager,
};
