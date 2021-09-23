const mqReceive = require('../../../js/common_server/mq/receive');
const program = require('../util/programArguments');
const mqTypes = require('../../../js/common/mq/types');
const logger = require('../util/logger');
const Pcap = require('../models/pcap');
const websocketManager = require('../managers/websocket');
const WS_EVENTS = require('../enums/wsEvents');

const preprocessorAnnounceReceiver = mqReceive.createExchangeReceiver(
    program.rabbitmqUrl,
    mqTypes.exchanges.extractorStatus,
    [mqTypes.exchanges.extractorStatus.keys.announce]
);

function handlePreprocessorResponse({ msg, ack }) {
    try {
        const message = JSON.parse(msg.content.toString());
        logger('ingest-progress').info(JSON.stringify(message));

        Pcap.findOne({ id: message.id })
            .exec()
            .then((pcapData) => {
                // Everything is done, we must notify the GUI
                websocketManager.instance().sendEventToAllUsers({
                    event: WS_EVENTS.PCAP_FILE_ANALYZING,
                    data: Object.assign({}, pcapData._doc, { progress: message.percentage }),
                });
            });
    } catch (err) {
        logger('ingest-progress').error(`${err}`);
    } finally {
        ack();
    }
}

preprocessorAnnounceReceiver.emitter.on(mqReceive.onMessageKey, handlePreprocessorResponse);
