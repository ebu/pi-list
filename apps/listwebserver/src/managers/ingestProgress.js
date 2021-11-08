import {
    mq
} from '@bisect/bisect-core-ts-be';
import {
    api
} from '@bisect/ebu-list-sdk';
const program = require('../util/programArguments');
import logger from '../util/logger';
const Pcap = require('../models/pcap');
const websocketManager = require('../managers/websocket');
const WS_EVENTS = require('../enums/wsEvents');

const extractorProgressReceiver = mq.createExchangeReceiver(program.rabbitmqUrl, api.mq.exchanges.extractorStatus, [
    api.mq.exchanges.extractorStatus.keys.progress,
]);

function handleProgressMessage(msg) {
    try {
        const message = JSON.parse(msg.toString());
        // logger('ingest-progress').info(JSON.stringify(message));

        Pcap.findOne({
                id: message.id
            })
            .exec()
            .then((pcapData) => {
                // Everything is done, we must notify the GUI
                websocketManager.instance().sendEventToAllUsers({
                    event: api.wsEvents.Pcap.analyzing,
                    data: Object.assign({}, pcapData._doc, {
                        progress: message.percentage
                    }),
                });
            });
    } catch (err) {
        logger('ingest-progress').error(`${err}`);
    }
}

extractorProgressReceiver.emitter.on(mq.onMessageKey, handleProgressMessage);