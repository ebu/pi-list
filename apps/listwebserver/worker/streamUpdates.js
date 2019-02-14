const amqp = require('amqplib/callback_api');
const websocketManager = require('../managers/websocket');

// todo: receive rabbitmq via program arguments
// todo: handler errors via err

amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
        console.error('Error connecting to AMQP queue:', err);
        return;
    }

    conn.createChannel( (err, ch) => {
        const exchangeName = 'stream_info';
        const topics = ["stream_update.*"]; // format: <event_type, stream_id>
        const queue_name = ''; // unnamed queue

        ch.assertExchange(exchangeName, 'topic', {durable: false});

        ch.assertQueue(queue_name, {exclusive: true}, (err, q) => {

            topics.forEach( (key) => {
                ch.bindQueue(q.queue, exchangeName, key);
            });

            ch.consume(q.queue, (msg) => {
                const data = JSON.parse(msg.content.toString());

                websocketManager.instance().sendEventToAllUsers(
                {
                    event: 'STREAM_UPDATE',
                    data: data
                });

            }, {noAck: true});
        });
    });
});

// <stream_update.stream_id>

