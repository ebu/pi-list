const websocketManager = require('../managers/websocket');
const mqReceive = require('../../../js/common_server/mq/receive');
const programArguments = require('../util/programArguments');
const mqtypes = require('../../../js/common/mq/types');

const updatesReceiver = mqReceive.createExchangeReceiver(
    programArguments.rabbitmqUrl,
    mqtypes.exchanges.liveStreamUpdates,
    ['stream_update.*']
);

updatesReceiver.emitter.on(mqReceive.onMessageKey, msgContext => {
    const { msg, ack } = msgContext;

    try {
        const data = JSON.parse(msg.content.toString());

        websocketManager.instance().sendEventToAllUsers({
            event: 'STREAM_UPDATE',
            data: data,
        });
    } finally {
        ack();
    }
});
