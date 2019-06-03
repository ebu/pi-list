const programArguments = require('./programArguments');
const logger = require('./logger');
const mongoose = require('mongoose');

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = `Port ${programArguments.port}`;

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
    logger('server').info(`LIST Web Server listening on ${programArguments.port}`);
}

function onProcessClosed() {
    logger('server').info(`Closing LIST Web Server`);
    mongoose.disconnect();
    process.exit(0);
}

module.exports = {
    onError,
    onListening,
    onProcessClosed
};
