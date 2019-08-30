const logger = require('../util/logger');
const mqReceive = require('../../../js/common_server/mq/receive');
const mqtypes = require('../../../js/common/mq/types');
const programArguments = require('../util/programArguments');

logger('probes-manager').info('Monitoring probes');

const announceReceiver = mqReceive.createExchangeReceiver(
    programArguments.rabbitmqUrl,
    mqtypes.exchanges.probeStatus,
    [mqtypes.exchanges.probeStatus.keys.announce]
);

const handleAnnounceMessage = ({ msg, ack }) => {
    try {
        const message = JSON.parse(msg.content.toString());
        const { id, status } = message;
        // logger('probes-manager').info(
        //     `Status update - ${msg.content.toString()}`
        // );
    } catch (err) {
        const message = `Error processing probe status update: ${err.message}`;
        logger('probes-manager').error(message);
    } finally {
        ack();
    }
};

announceReceiver.emitter.on(mqReceive.onMessageKey, handleAnnounceMessage);

const createManager = () => {
    return Promise.resolve({
        getProbes: () => [],
        close: () => {},
    });
};

module.exports = {
    createManager,
};
