const uuidv1 = require('uuid/v1');
const workflows = require('../../../../js/common/workflows/schema');
const mqtypes = require('../../../../js/common/mq/types');
const programArguments = require('../../util/programArguments');
const logger = require('../../util/logger');
const {
    createQueueSender,
    createExchangeSender,
} = require('../../../../js/common_server/mq/send');
const mqReceive = require('../../../../js/common_server/mq/receive');

const activeWorkflows = {};

const mqttSender = createExchangeSender(
    programArguments.rabbitmqUrl,
    mqtypes.exchanges.mqtt
);
const sendMqttUpdate = payload =>
    mqttSender.send({
        key: mqtypes.exchanges.mqtt.topics.workflows.update,
        msg: payload,
    });

const getWorkflows = () => Object.values(activeWorkflows);

const addWorkflow = wf => {
    logger('workflow-controller').info(
        `Added workflow ${wf.id} of type ${wf.type}`
    );
    activeWorkflows[wf.id] = wf;
    sendMqttUpdate({
        added: [wf]
    })
};

const updateWorkflow = ({ id, status, payload }) => {
    const wf = activeWorkflows[id];
    if (!wf) {
        logger('workflow-controller').error(`Unknown workflow with id ${id}`);
        return;
    }

    const now = Date.now();

    wf.state.status = status;
    wf.meta.times.lastUpdated = now;

    if (
        status == workflows.status.completed ||
        status == workflows.status.failed
    ) {
        wf.meta.times.completed = now;
    }

    if (status == workflows.status.failed) {
        wf.state.errorMessage = payload;
    }

    sendMqttUpdate({
        updated: [wf]
    })
};

const statusReceiver = mqReceive.createQueueReceiver(
    programArguments.rabbitmqUrl,
    mqtypes.queues.workflowStatus
);
const handleStatusMessage = ({ msg, ack }) => {
    try {
        const message = JSON.parse(msg.content.toString());
        const { id, status } = message;
        logger('workflow-controller').info(
            `Status update - id: ${id}; status: ${status}`
        );
        updateWorkflow(message);
    } catch (err) {
        const message = `Error processing workflow update: ${err.message}`;
        logger('workflow-controller').error(message);
    } finally {
        ack();
    }
};
statusReceiver.emitter.on(mqReceive.onMessageKey, handleStatusMessage);

const workSender = createQueueSender(
    programArguments.rabbitmqUrl,
    mqtypes.queues.workflowRequest
);

const captureAndIngest = require('./captureAndIngest');

const doCreateWorkflow = async (wf, inputConfig) => {
    /* Workflow modules must export the following functions:
    createWorkflow = async (wf, inputConfig, workSender)
    */
    const moduleName = `./${wf.type}`;
    const module = require(moduleName);
    if (!module) {
        throw Error(`Unknown workflow type ${wf.type}`);
    }

    const createFunction = module.createWorkflow;
    if (!createFunction) {
        throw Error(`Create function not exported for workflow ${wf.type}`);
    }

    await createFunction(wf, inputConfig, workSender);
    return;
};

const createBareWorkflowDescriptor = (type, userId) => ({
    id: uuidv1(),
    type: type,
    state: {
        status: workflows.status.requested,
        errorMessage: undefined,
    },
    meta: {
        createdBy: userId,
        times: {
            created: Date.now(),
            lastUpdated: undefined,
            completed: undefined,
        },
    },
});

const createWorkflow = async (type, userId, inputConfig) => {
    try {
        const wf = createBareWorkflowDescriptor(type, userId);
        logger('workflow-controller').info(
            `Creating workflow ${wf.id} of type ${wf.type}`
        );
        await doCreateWorkflow(wf, inputConfig);
        addWorkflow(wf);
        return wf.id;
    } catch (err) {
        const message = `Error creating workflow: ${err.message}`;
        logger('workflow-controller').error(message);
        throw err;
    }
};

module.exports = {
    getWorkflows,
    createWorkflow,
};
