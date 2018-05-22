#!/usr/bin/env node

const http = require('http');
const app = require('./app');
const programArguments = require('./util/programArguments');
const logger = require('./util/logger');
const websocketManager = require('./managers/websocket');
const {onError, onListening, onProcessClosed } = require('./util/serverUtils');

logger('server').info(`LIST web server root folder: ${programArguments.folder}`);
logger('server').info(`Path for the executables directory: ${programArguments.cpp}`);
logger('server').info(`InfluxDB URL: ${programArguments.influxURL}`);
logger('server').info(`Mode: ${programArguments.developmentMode ? 'DEV' : 'PRODUCTION'}`);

app.set('port', programArguments.port);
const httpServer = http.createServer(app);

websocketManager.initialize(httpServer);
httpServer.listen(programArguments.port);

httpServer.on('error', onError);
httpServer.on('listening', onListening);
process.on('SIGINT', onProcessClosed);

