#!/usr/bin/env node

const http = require('http');
const app = require('./app');
const programArguments = require('./util/programArguments');
const logger = require('./util/logger');
const databaseManager = require('./managers/database');
const websocketManager = require('./managers/websocket');

logger('server').info(`LIST web server root folder: ${programArguments.folder}`);
logger('server').info(`Path for the executables directory: ${programArguments.cpp}`);
logger('server').info(`InfluxDB URL: ${programArguments.influxURL}`);
logger('server').info(`Mode: ${programArguments.developmentMode ? 'DEV' : 'PRODUCTION'}`);

app.set('port', programArguments.port);

const httpServer = http.createServer(app);

const websocketServer = websocketManager.initialize(httpServer);

httpServer.listen(programArguments.port);

httpServer.on('error', onError);
httpServer.on('listening', onListening);
process.on('SIGINT', onProcessClosed);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

  const bind = typeof programArguments.port === 'string'
      ? `Pipe ${programArguments.port}`
      : `Port ${programArguments.port}`;

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

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = httpServer.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger('server').info(`LIST Web Server listening on ${bind}`);
}

function onProcessClosed() {
    logger('server').info(`Closing LIST Web Server`);
    databaseManager.close();
    process.exit(0);
}
