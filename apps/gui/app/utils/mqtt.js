import Paho from 'paho-mqtt';

// TODO: get this from the backend
const wsbroker = window.location.hostname; // mqtt websocket enabled broker
let wsport = 15675; // port for above
if (window.location.protocol === 'https:') wsport = 443;
const path = '/ws';

const useMqttMessages = (topic, onMessage) => {
    const client = new Paho.Client(wsbroker, wsport, path, `myclientid_${parseInt(Math.random() * 100, 10)}`);

    client.onConnectionLost = function(responseObject) {
        console.log(`Stream updates - CONNECTION LOST - ${responseObject.errorMessage}`);
    };

    client.onMessageArrived = message => {
        onMessage(message.destinationName, JSON.parse(message.payloadString));
    };

    const options = {
        timeout: 3,
        keepAliveInterval: 30,
        onSuccess() {
            console.log('Stream updates - CONNECTION SUCCESS');
            client.subscribe(topic, { qos: 1 });
        },
        onFailure(message) {
            console.log(`Stream updates - CONNECTION FAILURE - ${message.errorMessage}`);
        },
    };

    if (window.location.protocol === 'https:') options.useSSL = true;

    console.log(`Stream updates - CONNECT TO ${wsbroker}:${wsport}`);
    client.connect(options);

    return () => {
        client.disconnect();
    };
};

export { useMqttMessages };
