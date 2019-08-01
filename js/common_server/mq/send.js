const logger = require('../logging/logger');
const { setupChannel } = require('./common');

// TODO: allow to set a policy to limit the delayed send queue to some size
const MAX_OUTSTANDING_MESSAGES = 100;

const createQueuePipe = async (brokerUrl, queue) => {
    const { channel, close } = await setupChannel(brokerUrl);

    await channel.assertQueue(queue.name, queue.options);

    const send = ({ msg, persistent }) => {
        channel.sendToQueue(queue.name, Buffer.from(JSON.stringify(msg)), {
            persistent: persistent,
        });
    };

    return {
        send,
        close,
    };
};

const createExchangePipe = async (brokerUrl, exchange) => {
    const { channel, close } = await setupChannel(brokerUrl);

    channel.assertExchange(exchange.name, exchange.type, exchange.options);

    const send = ({ key, msg }) => {
        channel.publish(exchange.name, key, Buffer.from(JSON.stringify(msg)));
    };

    return {
        send,
        close,
    };
};

const createGenericSender = (pipeCreator, brokerUrl, target) => {
    let sender = null;
    const outputQueue = [];
    const isDurable = target.options && target.options.durable;

    const doSend = async content => {
        try {
            if (!sender) {
                sender = await pipeCreator(brokerUrl, target);
            }

            sender.send(content);

            return true;
        } catch (err) {
            logger('queue-sender').error(
                `Error sending to target: ${err.message}`
            );

            sender = null;
        }

        return false;
    };

    const retrySend = async () => {
        logger('queue-sender').info(
            `Retrying to send. Output queue size: ${outputQueue.length}`
        );

        while (outputQueue.length > 0) {
            const content = outputQueue.shift();

            if (!(await doSend(content))) {
                outputQueue.unshift(content);
                return;
            }
        }

        stopRetryTimer();
    };

    let retryTimerId = null;
    const retryInterval = 1000;

    const startRetryTimer = () => {
        if (retryTimerId !== null) {
            return;
        }

        logger('queue-sender').info('Starting retry timer');

        retryTimerId = setInterval(retrySend, retryInterval);
    };

    const stopRetryTimer = () => {
        if (retryTimerId === null) {
            return;
        }

        logger('queue-sender').info('Stopping retry timer');

        clearInterval(retryTimerId);
        retryTimerId = null;
    };

    const isQueueFull = () => {
        return outputQueue.length > MAX_OUTSTANDING_MESSAGES;
    };

    const send = async content => {
        if (outputQueue.length > 0) {
            if (isQueueFull()) {
                const message = 'Error sending message. Discarded.';
                logger('queue-sender').error(message);
                throw new Error(message);
            } else {
                outputQueue.push(content);
            }
            return;
        }

        if (await doSend(content)) {
            return;
        }

        // Failed to send. Try to save the message, if required
        if (isDurable && !isQueueFull()) {
            outputQueue.push(content);
            logger('queue-sender').error(
                'Error sending message. Saving in memory.'
            );

            startRetryTimer();
        } else {
            logger('queue-sender').error('Error sending message. Discarded.');
        }
    };

    return {
        send,
        close: () => sender && sender.close(),
    };
};

const createExchangeSender = (brokerUrl, exchange) =>
    createGenericSender(createExchangePipe, brokerUrl, exchange);

const createQueueSender = (brokerUrl, queue) =>
    createGenericSender(createQueuePipe, brokerUrl, queue);

module.exports = {
    createQueueSender,
    createExchangeSender,
    persistent: true,
    notPersistent: false,
};
