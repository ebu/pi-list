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
const moment = require('moment');

const activeWorkflows = [];

const activeWorkflowsTimeoutControl = () => {
    // Check for started workflows
    let wfs = getWorkflows().filter(wf => wf.state.status === workflows.status.started).map(wf => wf);

    // How long is the workflow active without beeing updated?
    wfs.forEach(wf => {
        var maxValidWfDate = moment(wf.meta.times.lastUpdated).add(3, 'm').toDate();
        if (maxValidWfDate < moment(Date.now()))
        {
            let inputConfig = { ids: [wf.id]};
            doCancelWorkflow(wf.type, inputConfig);
        }
    })
}
setInterval(activeWorkflowsTimeoutControl, 5000);

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

const updateWorkflow = ({ id, status, percentage, payload }) => {
    const wf = activeWorkflows[id];
    if (!wf) {
        logger('workflow-controller').error(`Unknown workflow with id ${id}`);
        return;
    }

    const now = Date.now();
    wf.meta.times.lastUpdated = now;

    if (percentage != undefined)
        wf.state.percentage = percentage;
   
    if (status == workflows.status.started) {
        wf.count += 1;
        if (wf.count > 2) {
            let inputConfig = { ids: [id]};
            // Instead of cancel Workflow, abort Workflow is more appropriate
            // Pass a status trought the doCancelWorkflow, so that status will
            //  be used instead the actual 'canceled'
            doCancelWorkflow(wf.type, inputConfig);
        }
    }    

    if (status != undefined)
        wf.state.status = status;

    if (
        status == workflows.status.completed ||
        status == workflows.status.failed ||
        status == workflows.status.canceled
    ) {
        wf.meta.times.completed = now;
    }

    if (status == workflows.status.failed) {
        wf.state.errorMessage = payload;
    }

    // Keep an updated record in memory
    // Otherwise the wf.count verification will not work
    activeWorkflows[id] = wf;

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
        const { id, status, payload } = message;
        const error_message = status !== workflows.status.failed ? '' : `; message: ${payload}` ;

        logger('workflow-controller').info(
            `Status update - id: ${id}; status: ${status}${error_message}`
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

const doCreateWorkflow = async (wf, inputConfig) => {
    /* Workflow modules must export the following functions:
    createWorkflow = async (wf, inputConfig, workSender)
    */
    const moduleName = `./${wf.type}`;
    const module = require(moduleName);
    if (!module) {
        throw Error(`Unknown workflow type ${wf.type}`);
    }

    try {
        const createFunction = module.createWorkflow;
        if (!createFunction) {
            throw Error(`Create function not exported for workflow ${wf.type}`);
        }
        await createFunction(wf, inputConfig, workSender);
    } catch (err) {
        throw err;
    }

    return;
};

const doCancelWorkflow = async (type, inputConfig) => {
    const moduleName = `./${type}`;
    const module = require(moduleName);
    if (!module) {
        throw Error(`Unknown workflow type ${type}`);
    }

    const cancelFunction = module.cancelWorkflow;
    if (!cancelFunction) {
        throw Error(`Cancel function not exported for workflow`);
    }

    let payload = { canceled: inputConfig.ids };

    await cancelFunction(payload, mqttSender);
    return;
};

const createBareWorkflowDescriptor = (type, userId, userFolder) => ({
    id: uuidv1(),
    type: type,
    count: 0,
    state: {
        status: workflows.status.requested,
        errorMessage: undefined,
    },
    meta: {
        createdBy: userId,
        folder: userFolder,
        times: {
            created: Date.now(),
            lastUpdated: undefined,
            completed: undefined,
        },
    },
});

const createWorkflow = async (type, userId, userFolder, inputConfig) => {
    try {
        const wf = createBareWorkflowDescriptor(type, userId, userFolder);
        logger('workflow-controller').info(
            `Creating workflow ${wf.id} of type ${wf.type}`
        );
        await doCreateWorkflow(wf, inputConfig);
        addWorkflow(wf);
        return wf.id;
    } catch (err) {
        err.message = `Error creating workflow: ${err.message}`;
        logger('workflow-controller').error(err.message);
        throw err;
    }
};

const cancelWorkflow = async (type, inputConfig) => {
    try {
        logger('workflow-controller').info(
            `Cancel workflow ${inputConfig.ids} of type ${type}`
        );
        await doCancelWorkflow(type, inputConfig);
    } catch (err) {
        const message = `Error caneling workflow: ${err.message}`;
        logger('workflow-controller').error(message);
        throw err;
    }
};

module.exports = {
    getWorkflows,
    createWorkflow,
    cancelWorkflow,
};
