const programArguments = require('./programArguments');

const createMQTTSender = () => {
    return new Promise((resolve, reject) => {
        var amqp = require('amqplib/callback_api');
        const rabbitmqUrl = `amqp://${programArguments.rabbitmq.hostname}:${
            programArguments.rabbitmq.port
        }`;

        var exchange = 'amq.topic';

        amqp.connect(rabbitmqUrl, function(error0, connection) {
            if (error0) {
                reject(error0);
                return;
            }

            connection.createChannel(function(error1, channel) {
                if (error1) {
                    reject(error1);
                    return;
                }

                channel.assertExchange(exchange, 'topic');

                const send = (key, msg) => {
                    channel.publish(
                        exchange,
                        key,
                        Buffer.from(JSON.stringify(msg))
                    );
                };

                resolve({ send });
            });
        });
    });
};

module.exports = {
    createMQTTSender,
};
