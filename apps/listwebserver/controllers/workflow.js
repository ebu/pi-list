const EventEmitter = require('events');
const uuidv1 = require('uuid/v1');
const amqp = require('amqplib');
const workflows = require('../../../js/common/workflows/types');
const mq = require('../../../js/common/mq/types');
const programArguments = require('../util/programArguments');
const logger = require('../util/logger');
const liveSources = require('./live/sources');

/* 
workflow:
    id: string
    type: workflow.types
    configuration: any
    status: workflow.status
    progress: 0..1
    errorMessage: string
}
*/
const activeWorkflows = {};

const addWorkflow = wf => {
    logger('workflow-controller').info(
        `Added workflow ${wf.id} of type ${wf.type}`
    );
    activeWorkflows[wf.id] = wf;
};

const updateWorkflow = msg => {
    logger('workflow-controller').info(
        `Updated workflow: ${JSON.stringify(msg)}`
    );
};

// const createMqStatusReceiver = async rabbitmqUrl => {
//     const connection = await amqp.connect(rabbitmqUrl);
//     const channel = await connection.createChannel();

//     channel.assertQueue(
//         mq.queues.workflowStatus.name,
//         mq.queues.workflowStatus.options
//     );

//     logger('workflow-controller').info(' [*] Waiting for status messages.');

//     const onMessage = async msg => {
//         try {
//             logger('workflow-controller').info(`>>>>>>>>>>>>>>>>>>>>>>>> Received: ${msg.content.toString()}`);
//             const message = JSON.parse(msg.content.toString());

//             console.dir(message);
//         } catch (err) {
//             logger('server').error(
//                 `Error processing message: ${err.message}`
//             );
//         }
//     };

//     await channel.consume(mq.queues.workflowStatus.name, onMessage, {
//         noAck: true,
//     });

//     return {
//         close: () => connection.close(),
//     };
// };

// const createWorkSender = async rabbitmqUrl => {
//     const connection = await amqp.connect(rabbitmqUrl);
//     const channel = await connection.createChannel();

//     channel.assertQueue(
//         mq.queues.workflowRequest.name,
//         mq.queues.workflowRequest.options
//     );

//     const sendWork = work => {
//         logger('workflow-controller').info(
//             `Sending work request of type ${work.type}`
//         );
//         channel.sendToQueue(
//             mq.queues.workflowRequest.name,
//             Buffer.from(JSON.stringify(work)),
//             {
//                 persistent: true,
//             }
//         );
//     };

//     return {
//         sendWork,
//         close: () => connection.close(),
//     };
// };

// const workSender = await createWorkSender(programArguments.rabbitmqUrl);
// const statusReceiver = await createMqStatusReceiver(programArguments.rabbitmqUrl);

// const createWorkflow = async (type, inputConfig) => {
//     if (type === workflows.types.captureAndIngest) {
//         const id = uuidv1();
//         logger('workflow-controller').info(
//             `Creating workflow ${id} of type ${type}`
//         );

//         const wantedSenderIds = inputConfig.ids;
//         const wantedSenders = await liveSources.findLiveSources(
//             wantedSenderIds
//         );

//         const outputConfiguration = {
//             id,
//             ingestPutUrl: `${programArguments.apiUrl}/pcap`, // TODO: get the right URL
//             cookies: inputConfig.cookies,
//             senders: wantedSenders,
//             filename: inputConfig.filename,
//         };

//         const wf = {
//             id,
//             type,
//             configuration: outputConfiguration,
//             status: workflows.status.requested,
//             progress: 0,
//             errorMessage: '',
//         };

//         addWorkflow(wf);

//         workSender.sendWork({
//             type: wf.type,
//             configuration: wf.configuration,
//         });
//         return id;
//     }

//     throw Error(`Unknown workflow type ${type}`);
// };

//     const closeWorkflowController = async () => {
//         logger('workflow-controller').info('Closing');
//         await workSender.close();
//         await statusReceiver.close();
//     };

//     return {
//         createWorkflow,
//         closeWorkflowController,
//     };
// };

// module.exports = {
//     createWorkflowController,
// };

const createWorkflow = async () => {
    logger('workflow-controller').info('Creating workflow');
};

module.exports = {
    createWorkflow,
};
