const websocketManager = require('../managers/websocket');
import { mq } from '@bisect/bisect-core-ts-be';
import { api } from '@bisect/ebu-list-sdk';
const programArguments = require('../util/programArguments');

const updatesReceiver = mq.createExchangeReceiver(programArguments.rabbitmqUrl, api.mq.exchanges.liveStreamUpdates, [
    'stream_update.*',
]);

updatesReceiver.emitter.on(mq.onMessageKey, (msg) => {
    const data = JSON.parse(msg.toString());

    websocketManager.instance().sendEventToAllUsers({
        event: 'STREAM_UPDATE',
        data: data,
    });
});
