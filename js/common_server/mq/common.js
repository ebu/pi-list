const amqp = require('amqplib');
const logger = require('../logging/logger');

const setupChannel = async (brokerUrl, onChannelErrorCallback) => {
    if (!brokerUrl) throw new Error('AMQP broker URL not specified');

    const connection = await amqp.connect(brokerUrl);
    const channel = await connection.createChannel();

    const callCallback = err => {
        logger('mq').error('[AMQP] connection error', err);
        if (onChannelErrorCallback) {
            onChannelErrorCallback();
        }
    };

    const onConnectionError = err => {
        callCallback(`[AMQP] connection error: ${err.message}`);
    };

    const onConnectionClosed = () =>
        callCallback('[AMQP] connection closed');
    const onChannelError = err => {
        callCallback(`[AMQP] channel error: ${err.message}`);
    };
    const onChannelClosed = () => callCallback('[AMQP] channel closed');

    connection.on('error', onConnectionError);
    connection.on('close', onConnectionClosed);
    channel.on('error', onChannelError);
    channel.on('close', onChannelClosed);

    const close = () => {
        connection.off('error', onConnectionError);
        connection.off('close', onConnectionClosed);
        channel.off('error', onChannelError);
        channel.off('close', onChannelClosed);
        channel.close();
        connection.close();
    };

    return { channel, close };
};

module.exports = {
    setupChannel,
};
