const mongoose = require('mongoose');
const programArguments = require('../util/programArguments');
const logger = require('../util/logger');

function createNewConnection(databaseHostname, databasePort, databaseName) {
    const mongoDatabaseUrl = `mongodb://${databaseHostname}:${databasePort}/${databaseName}`;
    logger('database-manager').info(`Creating a connection to ${mongoDatabaseUrl}.`);

    const options = {
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        useFindAndModify: false, 
    };

    const conn = mongoose.createConnection(mongoDatabaseUrl, options);

    conn.then(
        connection => {
            logger('database-manager').info('Connected to DB.');
            return connection;
        },
        err => {
            logger('database-manager').error('Failed to create a connection to DB. Exiting.');

            process.exit(-1);
        });

    return conn;
}

const { hostname, port } = programArguments.database;
let databases_ = new Map();

module.exports = (databaseName) => {
    if (!databases_.has(databaseName)) {
        databases_.set(databaseName, createNewConnection(hostname, port, databaseName));
    }

    return databases_.get(databaseName);
};
