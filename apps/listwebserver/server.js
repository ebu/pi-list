#!/usr/bin/env node

const http = require('http');
const app = require('./app');
const programArguments = require('./util/programArguments');
const logger = require('./util/logger');
const websocketManager = require('./managers/websocket');
const { onError, onListening, onProcessClosed } = require('./util/serverUtils');

logger('server').info(
    `LIST web server root folder: ${programArguments.folder}`
);
logger('server').info(
    `Path for the executables directory: ${programArguments.cpp}`
);
logger('server').info(`InfluxDB URL: ${programArguments.influxURL}`);
logger('server').info(
    `Mode: ${programArguments.developmentMode ? 'DEV' : 'PRODUCTION'}`
);
logger('server').info(`Live Features: ${programArguments.liveMode}`);
logger('server').info(
    `Version: v${programArguments.version.major}.${
        programArguments.version.minor
    } @ ${programArguments.version.hash}`
);

app.set('port', programArguments.port);
const httpServer = http.createServer(app);

websocketManager.initialize(httpServer);
httpServer.listen(programArguments.port);

if (programArguments.liveMode) {
    logger('server').info(`Starting message queue worker`);
    require('./worker/streamUpdates');

    const { createManager } = require('./managers/probes');
    createManager(programArguments)
        .then(
            probesManager =>
                (programArguments.probesManager = probesManager)
        )
        .catch(err =>
            logger('server').error(`Error creating probes manager: ${err}`)
        );
}

httpServer.on('error', onError);
httpServer.on('listening', onListening);

const closeServer = async () => {
    logger('server').info('Shutting down');
    if (programArguments.probesManager) {
        programArguments.probesManager.close();
    }
    onProcessClosed();
};

process.on('SIGINT', async () => {
    await closeServer();
});
