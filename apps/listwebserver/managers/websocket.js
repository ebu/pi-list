const { isString, isObject } = require('lodash');
const logger = require('../util/logger');

let instance = null;

class WebSocket {
    constructor(app) {
        this.connections = new Map(); //<userID, socketID>

        this.websocket = require('socket.io')(app, { path: '/socket'});

        logger('websocket-manager').info('WebSocket server listen at :3030/socket');

        this.websocket.on('connection', (socket) => {
            socket.on('register', (userID) => {

                // This step will verify is the user has already any connection and close that connection
                if(this.connections.has(userID)) {
                    this.disconnectUser(userID);
                }

                this.connections.set(userID, socket.id);

                const sessionCount = Object.keys(this.websocket.sockets.connected).length;

                logger('websocket-manager').info(`User ${userID} successfully registered in the websocket server` +
                ` using the socket session ${socket.id}. Active Sessions: ${sessionCount}`);
            });

            socket.on('disconnect', () => {
                const sessionCount = Object.keys(this.websocket.sockets.connected).length;

                logger('websocket-manager').info(`Websocket connection ended (id: ${socket.id})` +
                    `. Active Sessions: ${sessionCount}`);
            });
        });

        return this;
    }

    sendEventToUser(userID, dataObject) {
        // logger('websocket-manager').info(`Message sent to ${userID} websocket channel`);
        this.websocket.to(this.connections.get(userID)).emit('message', dataObject);
    }

    sendEventToAllUsers(dataObject) {
        // logger('websocket-manager').info(`Message sent to all users`);
        this.connections.forEach( (value, key) => {
            this.sendEventToUser(key, dataObject);
        });
    }

    disconnectUser(userID) {
        logger('websocket-manager').info(
            `User ${userID} disconnected from websocket channel ${this.connections[userID]}`
        );

        // Yep sockets.sockets are really necessary!
        if (this.connections.has(userID) && isObject(this.websocket.sockets.sockets[this.connections.get(userID)])) {
            this.websocket.sockets.sockets[this.connections.get(userID)].disconnect();
        }

        if (this.connections.has(userID)) { // keep me to remove me from map
            this.connections.delete(userID);
        }
    }
}

module.exports = {
    initialize: (httpServer) => {
        if (!instance) {
            instance = new WebSocket(httpServer);
        }

        return instance;
    },
    instance: () => instance
};
