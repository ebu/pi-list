#!/usr/bin/env node

/*
For information about the configuration file, see config.yml
*/

const amqp = require('amqplib');
const logger = require('./logger');
const SDK = require('@bisect/ebu-list-sdk')
const { mq } = require('@bisect/bisect-core-ts-be');
const { ingestFromFile } = require('./fromFile');
const { performCaptureAndIngest } = require('./capture');

///////////////////////////////////////////////////////////////////////////////

const workflowTypes = SDK.api.workflows.types;
const workflowStatus = SDK.api.workflows.status;

const mqExchanges = SDK.api.mq.exchanges;
const mqQueues = SDK.api.mq.queues;

const commander = require('commander');
const yamlParser = require('read-yaml');

commander
    .arguments('<configFile>')
    .action((configFile) => {
        globalConfig = yamlParser.sync(configFile);

        if (globalConfig.rabbitmq.hostname === undefined || globalConfig.rabbitmq.port === undefined) {
            console.error('RabbitMQ is not configured in config file');
            process.exit(-1);
        }

        globalConfig.rabbitmqUrl = `amqp://${globalConfig.rabbitmq.hostname}:${globalConfig.rabbitmq.port}`;
    })
    .parse(process.argv);

if (typeof globalConfig === 'undefined') {
    console.error('no config file given!');
    process.exit(1);
}

///////////////////////////////////////////////////////////////////////////////

logger('probe').info(`Starting probe`);
logger('probe').info(`Connecting to ${globalConfig.rabbitmqUrl}`);

///////////////////////////////////////////////////////////////////////////////

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const onCancelMessage = async (msg, sendStatus) => {
    try {
        const message = JSON.parse(msg);
        const { canceled } = message;

        /*
         * The flow for cancelation was mounted.
         * At this point, for each flow to be canceled there must
         * be a action that really cancells the workflow.
         * For now, a fake update are being sent through the GUI
         */
        canceled.forEach(function (item) {
            // TODO: CANCEL THE WORKFLOW AND SEND STATUS

            sendStatus({
                msg: {
                    id: item,
                    status: workflowStatus.canceled,
                },
                persistent: mq.persistent,
            });
        });
    } catch (err) {
        logger('probe').error(`Error cancelling workflows: ${err.message}`);
    }
};

const onWorkMessage = async (msg, sendStatus) => {
    try {
        logger('probe').info(`Received message`);
        const message = JSON.parse(msg);
        logger('probe').info(JSON.stringify(message));
        const { type, configuration } = message;
        const workflowConfig = configuration;

        if (type === workflowTypes.captureAndIngest) {
            if (
                !workflowConfig.id ||
                !workflowConfig.senders ||
                !workflowConfig.authorization ||
                !workflowConfig.url ||
                !workflowConfig.durationMs ||
                !workflowConfig.filename
            ) {
                const event = {
                    id: workflowConfig.id,
                    status: workflowStatus.failed,
                    payload: {
                        // TODO: error code ased on HTTP error codes
                        message: `invalid configuration: ${JSON.stringify(workflowConfig)}`,
                    },
                };

                sendStatus({
                    msg: event,
                    persistent: mq.persistent
                });
                throw new Error(JSON.stringify(event));
            }

            try {
                sendStatus({
                    msg: {
                        id: workflowConfig.id,
                        status: workflowStatus.started,
                        percentage: 0,
                    },
                    persistent: mq.persistent,
                });

                if (globalConfig.engine === 'fromFile') {
                    await ingestFromFile(globalConfig, workflowConfig);
                } else {
                    await performCaptureAndIngest(globalConfig, workflowConfig);
                }

                sendStatus({
                    msg: {
                        id: workflowConfig.id,
                        status: workflowStatus.completed,
                        percentage: 100,
                    },
                    persistent: mq.persistent,
                });

                logger('probe').info(' [x] Done');
            } catch (err) {
                logger('probe').error(`Error processing message: ${err.message}`);
                sendStatus({
                    msg: {
                        id: workflowConfig.id,
                        status: workflowStatus.failed,
                        payload: {
                            message: err.message,
                        },
                    },
                    persistent: mq.persistent,
                });
            }
        }
    } catch (err) {
        logger('probe').error(`Error processing message: ${err.message}`);
    }
};

const run = async () => {
    const cancelReceiver = mq.createExchangeReceiver(globalConfig.rabbitmqUrl, mqExchanges.mqtt, [
        mqExchanges.mqtt.topics.workflows.cancel,
    ]);

    const handleCancelMessage = (msgContext) => onCancelMessage(msgContext, statusSender.send);

    cancelReceiver.emitter.on(mq.onMessageKey, handleCancelMessage);

    const heartBeatSender = mq.createExchangeSender(globalConfig.rabbitmqUrl, mqExchanges.probeStatus);

    const statusSender = mq.createQueueSender(globalConfig.rabbitmqUrl, mqQueues.workflowStatus);

    const workReceiver = mq.createQueueReceiver(globalConfig.rabbitmqUrl, mqQueues.workflowRequest);
    const handleMessage = (msgContext) => onWorkMessage(msgContext, statusSender.send);

    workReceiver.emitter.on(mq.onMessageKey, handleMessage);

    const onProcessClosed = () => {
        logger('probe').info(`Closing probe`);
        clearInterval(timer);
        heartBeatSender.close();
        workReceiver.emitter.off(mq.onMessageKey, handleMessage);
        workReceiver.close();
        statusSender.close();
    };

    process.on('SIGINT', onProcessClosed);

    const timer = setInterval(async () => {
        try {
            const data = {
                probe: { id: globalConfig.probe.id, label: globalConfig.probe.label },
            };

            await heartBeatSender.send({
                key: mqExchanges.probeStatus.keys.announce,
                msg: data,
            });
        } catch (err) {
            logger('probe').error(`Error sending announce message: ${err}`);
        }
    }, 1000);
};

run().catch((err) => {
    logger('probe').error(`Error: ${err}`);
    process.exit(-1);
});
