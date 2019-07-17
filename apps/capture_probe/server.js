#!/usr/bin/env node

const amqp = require('amqplib');
const logger = require('./logger');
const workflows = require('ebu_list_common/workflows/types');
const mq = require('ebu_list_common/mq/types');
const { ingestFromFile } = require('./fromFile');
const { performCaptureAndIngest } = require('./capture');

///////////////////////////////////////////////////////////////////////////////

const commander = require('commander');
const yamlParser = require('read-yaml');

commander
    .arguments('<configFile>')
    .action((configFile) => {
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

const createMqSender = async rabbitmqUrl => {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    channel.assertExchange(mq.exchanges.probeStatus, 'fanout', {
        durable: false,
    });

    const close = () => connection.close();

    const send = msg => {
        channel.publish(
            mq.exchanges.probeStatus,
            mq.keys.probeStatus.announce,
            Buffer.from(JSON.stringify(msg))
        );
    };

    return { send, close };
};

const createWorkflowStatusSender = async rabbitmqUrl => {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    channel.assertQueue(
        mq.queues.workflowStatus.name,
        mq.queues.workflowStatus.options
    );

    const send = status => {
        logger('workflow-controller').info(`Sending status update`);
        channel.sendToQueue(
            mq.queues.workflowStatus.name,
            Buffer.from(JSON.stringify(status)),
            {
                persistent: true,
            }
        );
    };

    return {
        send,
        close: () => {
            connection.close();
        },
    };
};

const createMqWorkReceiver = async (rabbitmqUrl, sendStatus) => {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    channel.assertQueue(
        mq.queues.workflowRequest.name,
        mq.queues.workflowRequest.options
    );

    channel.prefetch(1);
    logger('server').info(' [*] Waiting for messages. To exit press CTRL+C');

    const onMessage = async msg => {
        try {
            logger('server').info(`Received: ${msg.content.toString()}`);
            const message = JSON.parse(msg.content.toString());

            console.dir(message);
            const { type, configuration } = message;

            if (type === workflows.types.captureAndIngest) {
                if (
                    !configuration.id ||
                    !configuration.senders ||
                    !configuration.cookies ||
                    !configuration.ingestPutUrl ||
                    !configuration.filename
                ) {
                    const event = {
                        id: configuration.id,
                        status: workflows.status.failed,
                        payload: {
                            // TODO: error code ased on HTTP error codes
                            message: `invalid configuration: ${JSON.stringify(
                                configuration
                            )}`,
                        },
                    };

                    sendStatus(event);
                    throw new Error(JSON.stringify(event));
                }

                try {
                    sendStatus({
                        id: configuration.id,
                        status: workflows.status.started,
                    });

                    if (config.dummy_pcap) {
                        await ingestFromFile(configuration, sendStatus);
                    } else {
                        await performCaptureAndIngest(
                            configuration,
                            sendStatus
                        );
                    }

                    sendStatus({
                        id: configuration.id,
                        status: workflows.status.completed,
                    });

                    logger('server').info(' [x] Done');
                } catch (err) {
                    logger('server').error(
                        `Error processing message: ${err.message}`
                    );
                    sendStatus({
                        id: configuration.id,
                        status: workflows.status.failed,
                        payload: {
                            message: err.message,
                        },
                    });
                }
            }
        } catch (err) {
            logger('server').error(`Error processing message: ${err.message}`);
        } finally {
            channel.ack(msg);
        }
    };

    channel.consume(mq.queues.workflowRequest.name, onMessage, {
        noAck: false,
    });

    return {
        close: () => connection.close(),
    };
};

const run = async () => {
    const heartBeatSender = await createMqSender(config.rabbitmqUrl);
    const statusSender = await createWorkflowStatusSender(config.rabbitmqUrl);
    const workReceiver = await createMqWorkReceiver(
        config.rabbitmqUrl,
        statusSender.send
    );

    const onProcessClosed = () => {
        logger('server').info(`Closing server`);
        clearInterval(timer);
        heartBeatSender.close();
        workReceiver.close();
        statusSender.close();
    };

    process.on('SIGINT', onProcessClosed);

    const timer = setInterval(() => {
        heartBeatSender.send({
            probe: { id: config.probe.id, label: config.probe.label },
        });
    }, 1000);
};

run().catch(err => {
    logger('server').error(`Error: ${err}`);
    process.exit(-1);
});
