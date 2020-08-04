import io from 'socket.io-client';
import mitt from 'mitt';

import { WS_SERVER_URL } from 'utils/api';

let socket = null;
let uID = null;
const eventManager = mitt();

const onMessage = wsData => {
    eventManager.emit(wsData.event, wsData.data);
};

const onConnect = () => {
    socket.emit('register', uID);
};

function initialize(userID) {
    if (socket !== null) {
        return;
    }

    uID = userID;

    socket = io(`${WS_SERVER_URL}/`, {
        path: '/socket',
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 2000,
        autoConnect: true,
    });

    // socket.emit('register', userID);

    socket.on('connect', onConnect);
    socket.on('message', onMessage);
}

function shutdown() {
    if (socket === null) {
        return;
    }

    socket.off('message', onMessage);
    socket.off('connect', onConnect);
    socket = null;
}

function socketId() {
    if (socket === null) {
        return;
    }
    return socket.id;
}

export default {
    initialize,
    shutdown,
    socketId,
    on: eventManager.on,
    off: eventManager.off,
};
