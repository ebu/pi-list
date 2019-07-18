import io from 'socket.io-client';
import mitt from 'mitt';

import { WS_SERVER_URL } from 'utils/api';

let socket = null;
const eventManager = mitt();

function initialize(userID) {
    if (socket !== null) {
        return;
    }

    socket = io(`${WS_SERVER_URL}/`, { path: '/socket' });

    socket.emit('register', userID);

    socket.on('message', wsData => {
        eventManager.emit(wsData.event, wsData.data);
    });
}

export default {
    initialize,
    on: eventManager.on,
    off: eventManager.off,
};
