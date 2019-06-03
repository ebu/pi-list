import Paho from 'paho-mqtt';

// TODO: get this from the backend
const wsbroker = location.hostname; // mqtt websocket enabled broker
const wsport = 15675; // port for above
const path = '/ws';

const useMqttMessages = (topic, onMessage) => {
    const client = new Paho.Client(
        wsbroker,
        wsport,
        path,
        `myclientid_` + parseInt(Math.random() * 100, 10)
    );

    client.onConnectionLost = function(responseObject) {
        console.log(
            'Stream updates - CONNECTION LOST - ' + responseObject.errorMessage
        );
    };

    client.onMessageArrived = message => {
        onMessage(message.destinationName, JSON.parse(message.payloadString));
    };

    const options = {
        timeout: 3,
        keepAliveInterval: 30,
        onSuccess: function() {
            console.log('Stream updates - CONNECTION SUCCESS');
            client.subscribe(topic, { qos: 1 });
        },
        onFailure: function(message) {
            console.log(
                'Stream updates - CONNECTION FAILURE - ' + message.errorMessage
            );
        },
    };

    if (location.protocol == 'https:') {
        options.useSSL = true;
    }
    console.log('Stream updates - CCONNECT TO ' + wsbroker + ':' + wsport);
    client.connect(options);

    return () => {
        client.disconnect();
    };
};

export { useMqttMessages };
