#!/usr/bin/env node

/*
For information about the configuration file, see config.yml
*/

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
        globalConfig = yamlParser.sync(configFile);

        if (
            globalConfig.rabbitmq.hostname === undefined ||
            globalConfig.rabbitmq.port === undefined
        ) {
            console.error('RabbitMQ is not configured in config file');
            process.exit(-1);
        }

        globalConfig.rabbitmqUrl = `amqp://${globalConfig.rabbitmq.hostname}:${
            globalConfig.rabbitmq.port
        }`;
    })
    .parse(process.argv);

if (typeof globalConfig === 'undefined') {
    console.error('no config file given!');
    process.exit(1);
}

///////////////////////////////////////////////////////////////////////////////

logger('server').info(`Starting server`);
logger('server').info(`Connecting to ${globalConfig.rabbitmqUrl}`);

///////////////////////////////////////////////////////////////////////////////

const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const onCancelMessage = async (msgContext, sendStatus) => {
    const { msg, ack } = msgContext;

    try {
        const message = JSON.parse(msg.content.toString());
        const { canceled } = message;
        

        /*
        * The flow for cancelation was mounted.
        * At this point, for each flow to be canceled there must
        * be a action that really cancells the workflow.
        * For now, a fake update are being sent through the GUI
        */
        canceled.forEach(function(item) {
            // TODO: CANCEL THE WORKFLOW AND SEND STATUS

            sendStatus({
                msg: {
                    id: item,
                    status: workflowsSchema.status.canceled,
                },
                persistent,
            });
          });

    } catch (err) {
        logger('server').error(`Error cancelling workflows: ${err.message}`);
    } finally {
        ack();
    }
};



const onWorkMessage = async (msgContext, sendStatus) => {
    const { msg, ack } = msgContext;
    
    try {
        logger('server').info(`Received message`);
        const message = JSON.parse(msg.content.toString());

        const { type, configuration } = message;
        const workflowConfig = configuration;

        if (type === workflowTypes.types.captureAndIngest) {
            if (
                !workflowConfig.id ||
                !workflowConfig.senders ||
                !workflowConfig.authorization ||
                !workflowConfig.ingestPutUrl ||
                !workflowConfig.durationMs ||
                !workflowConfig.filename
            ) {
                const event = {
                    id: workflowConfig.id,
                    status: workflowsSchema.status.failed,
                    payload: {
                        // TODO: error code ased on HTTP error codes
                        message: `invalid configuration: ${JSON.stringify(
                            workflowConfig
                        )}`,
                    },
                };

                sendStatus({ msg: event, persistent });
                throw new Error(JSON.stringify(event));
            }

            try {
                // await sleep(1000);

                sendStatus({
                    msg: {
                        id: workflowConfig.id,
                        status: workflowsSchema.status.started,
                        percentage: 0,
                    },
                    persistent,
                });

                // await sleep(1000);

                // if(Math.random() > 0.6) {
                //     throw new Error("Boom!");
                // }

                if (globalConfig.dummy_pcap) {
                    await ingestFromFile(globalConfig, workflowConfig);
                } else {
                    await performCaptureAndIngest(globalConfig, workflowConfig);
                }

                sendStatus({
                    msg: {
                        id: workflowConfig.id,
                        status: workflowsSchema.status.completed,
                        percentage: 100,
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
                        id: workflowConfig.id,
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
    const cancelReceiver = mqReceive.createExchangeReceiver(
        globalConfig.rabbitmqUrl,
        mq.exchanges.mqtt,
        [mq.exchanges.mqtt.topics.workflows.cancel]
    );
    const handleCancelMessage = msgContext =>
        onCancelMessage(msgContext, statusSender.send);

    cancelReceiver.emitter.on(mqReceive.onMessageKey, handleCancelMessage);

    const heartBeatSender = createExchangeSender(
        globalConfig.rabbitmqUrl,
        mq.exchanges.probeStatus
    );

    const statusSender = createQueueSender(
        globalConfig.rabbitmqUrl,
        mq.queues.workflowStatus
    );

    const workReceiver = mqReceive.createQueueReceiver(
        globalConfig.rabbitmqUrl,
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
                probe: { id: globalConfig.probe.id, label: globalConfig.probe.label },
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
