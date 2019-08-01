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

/* 
exchangeInfo:
    name : string
    type : string
    options : Object

    onMessageCallback receives: { msg : any, ack : function }
    ack MUST be called to confirm that the message has been processed
*/
const doCreateExchangeReceiver = async (
    brokerUrl,
    exchangeInfo,
    topics,
    onMessageCallback,
    onChannelErrorCallback
) => {
    const { channel, close } = await setupChannel(
        brokerUrl,
        onChannelErrorCallback
    );

    await channel.assertExchange(
        exchangeInfo.name,
        exchangeInfo.type,
        exchangeInfo.options
    );

    const queueName = ''; // unnamed queue
    const queueOptions = { exclusive: true }; // unnamed queue
    const q = await channel.assertQueue(queueName, queueOptions);
    
    topics.forEach(async key => await channel.bindQueue(q.queue, exchangeInfo.name, key));

    channel.prefetch(1);
    logger('mq').info(` [*] Waiting for messages in exchange ${exchangeInfo.name}`);

    const onMessage = msg =>
        onMessageCallback({
            msg,
            ack: () => channel.ack(msg),
        });

    await channel.consume(q.queue, onMessage, {
        noAck: false,
    });

    return {
        close: close,
    };
};

const createGenericReceiver = creator => {
    const emitter = new EventEmitter();
    const onMessage = msg => {
        emitter.emit(onMessageKey, msg);
    };

    let receiver = null;

    const healthChecker = async () => {
        if (receiver !== null || creatingNow) {
            return;
        }

        logger('mq').info('Health checker: trying to create receiver');
        try {
            creatingNow = true;
            receiver = await creator(onMessage, onChannelError);
        } catch (err) {
            logger('mq').error(`Error connecting to queue: ${queue.name}`);
            receiver = null;
        } finally {
            creatingNow = false;
        }
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

    startHealthChecker();

    return {
        emitter,
        close: doClose,
    };
};

const createQueueReceiver = (brokerUrl, queue) => {
    const creator = async (onMessage, onChannelError) =>
        doCreateQueueReceiver(brokerUrl, queue, onMessage, onChannelError);

    return createGenericReceiver(creator);
};
const createExchangeReceiver = (brokerUrl, exchangeInfo, topics) => {
    const creator = async (onMessage, onChannelError) =>
        doCreateExchangeReceiver(
            brokerUrl,
            exchangeInfo,
            topics,
            onMessage,
            onChannelError
        );

    return createGenericReceiver(creator);
};

const onMessageKey = 'onMessage';

module.exports = {
    createQueueReceiver,
    createExchangeReceiver,
    onMessageKey,
};
