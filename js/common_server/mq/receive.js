const EventEmitter = require('events');
const logger = require('../logging/logger');
const { setupChannel } = require('./common');

/* 
    onMessageCallback receives: { msg : any, ack : function }
    ack MUST be called to confirm that the message has been processed
*/
const doCreateQueueReceiver = async (
    brokerUrl,
    queue,
    onMessageCallback,
    onChannelErrorCallback
) => {
    const { channel, close } = await setupChannel(
        brokerUrl,
        onChannelErrorCallback
    );

    await channel.assertQueue(queue.name, queue.options);

    channel.prefetch(1);
    logger('mq').info(` [*] Waiting for messages in ${queue.name}`);

    const onMessage = msg =>
        onMessageCallback({
            msg,
            ack: () => channel.ack(msg),
        });

    await channel.consume(queue.name, onMessage, {
        noAck: false,
    });

    return {
        close: close,
    };
};

const createQueueReceiver = (brokerUrl, queue) => {
    const emitter = new EventEmitter();
    const onMessage = msg => {
        logger('mq').info(` [*] Message received in ${queue.name}`);
        emitter.emit(onMessageKey, msg);
    };

    let receiver = null;

    const healthChecker = async () => {
        if (receiver !== null || creatingNow) {
            return;
        }

        logger('mq').info('Health checker: trying to create receiver');
        await createReceiver();
    };

    let healthCheckerTimerId = null;
    const healthCheckInterval = 1000;
    let creatingNow = false;

    const startHealthChecker = () => {
        if (healthCheckerTimerId !== null) {
            return;
        }

        healthCheckerTimerId = setInterval(healthChecker, healthCheckInterval);
    };

    const onChannelError = () => {
        logger('mq').error('Channel error');
        receiver = null;
    };

    const doClose = () => {
        clearInterval(healthCheckerTimerId);
        healthCheckerTimerId = null;
        receiver && receiver.close();
    };

    const createReceiver = async () => {
        try {
            creatingNow = true;
            receiver = await doCreateQueueReceiver(
                brokerUrl,
                queue,
                onMessage,
                onChannelError
            );
        } catch (err) {
            logger('mq').error(`Error connecting to queue: ${queue.name}`);
            receiver = null;
        } finally {
            creatingNow = false;
        }
    };

    startHealthChecker();

    return {
        emitter,
        close: doClose,
    };
};

const onMessageKey = 'onMessage';

module.exports = {
    createQueueReceiver,
    onMessageKey,
};
