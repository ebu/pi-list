const { isString, isObject } = require('lodash');
import logger from '../util/logger';

let instance = null;

class WebSocket {
    constructor(app) {
        this.connections = new Map(); //<userID, [socketID]>

        this.websocket = require('socket.io')(app, { path: '/socket' });

        logger('websocket-manager').info('WebSocket server listen at :3030/socket');

        this.websocket.on('connection', (socket) => {
            socket.on('register', (userID) => {
                // Add new connection
                let socketPool = this.connections.get(userID);
                socketPool === undefined ? (socketPool = [socket.id]) : socketPool.push(socket.id);
                this.connections.set(userID, socketPool);

                const sessionCount = Object.keys(this.websocket.sockets.connected).length;

                logger('websocket-manager').info(
                    `User ${userID} successfully registered in the websocket server` +
                        ` using the socket session ${socket.id}. Active Sessions: ${sessionCount}`
                );
            });

            socket.on('disconnect', () => {
                this.disconnectSession(socket.id);
                const sessionCount = Object.keys(this.websocket.sockets.connected).length;

                logger('websocket-manager').info(
                    `Websocket connection ended (id: ${socket.id})` + `. Active Sessions: ${sessionCount}`
                );
            });
        });

        return this;
    }

    sendEventToUser(userID, dataObject) {
        if (userID === null || userID === undefined) {
            logger('websocket-manager').error(`Cannot send user event because there is no userID defined`);

            return;
        }
        // logger('websocket-manager').info(`Message sent to ${userID} websocket channel`);
        const socketPool = this.connections.get(userID);
        socketPool.forEach((sID) => {
            this.websocket.to(sID).emit('message', dataObject);
        });
    }

    sendEventToAllUsers(dataObject) {
        // logger('websocket-manager').info(`Message sent to all users`);
        this.connections.forEach((value, key) => {
            this.sendEventToUser(key, dataObject);
        });
    }

    disconnectSession(socketID) {
        for (let [key, value] of this.connections) {
            value.forEach((sID) => {
                if (sID === socketID) {
                    if (isObject(this.websocket.sockets.sockets[sID])) this.websocket.sockets.sockets[sID].disconnect();

                    var newSocketPool = value.filter(function (el) {
                        return el != socketID;
                    });
                    this.connections.set(key, newSocketPool);
                    logger('websocket-manager').info(key + ' Will be removed ' + sID);
                }
            });
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
    instance: () => instance,
};
