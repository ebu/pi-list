const logger = require('../util/logger');
const amqp = require('amqplib');
const mq = require('../../../js/common/mq/types');

// logger('probes-manager').info('Monitoring probes');

// const createMqReceiver = async rabbitmqUrl => {
//     const connection = await amqp.connect(rabbitmqUrl);
//     const channel = await connection.createChannel();
//     channel.assertExchange(mq.exchanges.probeStatus, 'fanout', {
//         durable: false,
//     });

//     const close = () => connection.close();

//     const queue = await channel.assertQueue('', { exclusive: true });

//     channel.bindQueue(queue.queue, mq.exchanges.probeStatus, '');

//     const onMessage = msg => {
//         if (msg.content) {
//             // logger('probes-manager').info(` [x] ${msg.fields.routingKey} ${msg.content.toString()}`);
//         }
//     };

//     channel.consume(queue.queue, onMessage, {
//         noAck: true,
//     });

//     return { close };
// };

// const createManager = async programArguments => {
//     const probes = [];
//     const getProbes = () => probes;

//     const receiver = await createMqReceiver(programArguments.rabbitmqUrl);

//     const close = () => {
//         logger('probes-manager').info('Exiting probe manager');
//         receiver.close();
//     };

//     return { getProbes, close };
// };

const createManager = () => {
    return Promise.resolve({
        getProbes: () => [],
        close: () => {},
    });
};

module.exports = {
    createManager,
};
