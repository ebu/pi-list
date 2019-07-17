#!/usr/bin/env node

const http = require('http');
const logger = require('./logger');

///////////////////////////////////////////////////////////////////////////////

const config = {
    address: '0.0.0.0',
    port: 8765,
    nmos: {
        registrationUrl: 'http://localhost:8882/x-nmos/registration/v1.2',
    },
    heartbeatPeriodMs: 5000,
};

///////////////////////////////////////////////////////////////////////////////

const { self, init, deinit } = require('./app')(config);
const app = self;

app.set('port', config.port);
const httpServer = http.createServer(app);
httpServer.listen(config.port, config.address);

httpServer.on('error', onError);
httpServer.on('listening', () => onListening(httpServer));
process.on('SIGINT', onProcessClosed);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = `Port ${config.port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            Logger('server').error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger('server').error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(httpServer) {
    const listeningUrl = `http://${httpServer.address().address}:${httpServer.address().port}`;

    logger('server').info(`Server listening on ${listeningUrl}`);

    init(listeningUrl);
}

function onProcessClosed() {
    logger('server').info(`Closing server`);

    deinit();
}
