#!/usr/bin/env node

const amqp = require('amqplib');
const logger = require('./logger');
const workflowTypes = require('../../js/common/workflows/types');
const workflowsSchema = require('../../js/common/workflows/schema');
const mq = require('../../js/common/mq/types');
const {
    createQueueSender,
    createExchangeSender,
    persistent,
} = require('../../js/common_server/mq/send');
const mqReceive = require('../../js/common_server/mq/receive');
const { ingestFromFile } = require('./fromFile');
const { performCaptureAndIngest } = require('./capture');

///////////////////////////////////////////////////////////////////////////////

const commander = require('commander');
const yamlParser = require('read-yaml');

commander
    .arguments('<configFile>')
    .action(configFile => {
        config = yamlParser.sync(configFile);

        if (
            config.rabbitmq.hostname === undefined ||
            config.rabbitmq.port === undefined
        ) {
            console.error('RabbitMQ is not configured in config file');
            process.exit(-1);
        }

        config.rabbitmqUrl = `amqp://${config.rabbitmq.hostname}:${
            config.rabbitmq.port
        }`;
    })
    .parse(process.argv);

if (typeof config === 'undefined') {
    console.error('no config file given!');
    process.exit(1);
}

///////////////////////////////////////////////////////////////////////////////

logger('server').info(`Starting server`);
logger('server').info(`Connecting to ${config.rabbitmqUrl}`);

///////////////////////////////////////////////////////////////////////////////

const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const onWorkMessage = async (msgContext, sendStatus) => {
    const { msg, ack } = msgContext;

    try {
        logger('server').info(`Received message`);
        const message = JSON.parse(msg.content.toString());

        const { type, configuration } = message;

        if (type === workflowTypes.types.captureAndIngest) {
            if (
                !configuration.id ||
                !configuration.senders ||
                !configuration.cookies ||
                !configuration.ingestPutUrl ||
                !configuration.filename
            ) {
                const event = {
                    id: configuration.id,
                    status: workflowsSchema.status.failed,
                    payload: {
                        // TODO: error code ased on HTTP error codes
                        message: `invalid configuration: ${JSON.stringify(
                            configuration
                        )}`,
                    },
                };

                sendStatus({ msg: event, persistent });
                throw new Error(JSON.stringify(event));
            }

            try {
                sendStatus({
                    msg: {
                        id: configuration.id,
                        status: workflowsSchema.status.started,
                    },
                    persistent,
                });

                await sleep(2000);

                if (config.dummy_pcap) {
                    await ingestFromFile(configuration);
                } else {
                    await performCaptureAndIngest(configuration);
                }

                sendStatus({
                    msg: {
                        id: configuration.id,
                        status: workflowsSchema.status.completed,
                    },
                    persistent,
                });

                logger('server').info(' [x] Done');
            } catch (err) {
                logger('server').error(
                    `Error processing message: ${err.message}`
                );
                sendStatus({
                    msg: {
                        id: configuration.id,
                        status: workflowsSchema.status.failed,
                        payload: {
                            message: err.message,
                        },
                    },
                    persistent,
                });
            }
        }
    } catch (err) {
        logger('server').error(`Error processing message: ${err.message}`);
    } finally {
        ack();
    }
};

const run = async () => {
    const heartBeatSender = createExchangeSender(
        config.rabbitmqUrl,
        mq.exchanges.probeStatus
    );

    const statusSender = createQueueSender(
        config.rabbitmqUrl,
        mq.queues.workflowStatus
    );

    const workReceiver = mqReceive.createQueueReceiver(
        config.rabbitmqUrl,
        mq.queues.workflowRequest
    );
    const handleMessage = msgContext =>
        onWorkMessage(msgContext, statusSender.send);

    workReceiver.emitter.on(mqReceive.onMessageKey, handleMessage);

    const onProcessClosed = () => {
        logger('server').info(`Closing server`);
        clearInterval(timer);
        heartBeatSender.close();
        workReceiver.emitter.off(mqReceive.onMessageKey, handleMessage);
        workReceiver.close();
        statusSender.close();
    };

    process.on('SIGINT', onProcessClosed);

    const timer = setInterval(async () => {
        try {
            const data = {
                probe: { id: config.probe.id, label: config.probe.label },
            };

            await heartBeatSender.send({
                key: mq.exchanges.probeStatus.keys.announce,
                msg: data,
            });
        } catch (err) {
            logger('server').error(`Error sending announce message: ${err}`);
        }
    }, 1000);
};

run().catch(err => {
    logger('server').error(`Error: ${err}`);
    process.exit(-1);
});
