import mongoose from 'mongoose';
import logger from '../util/logger';
import { hostname, options, port } from './databaseCommon';

const databases_ = new Map();

function createNewConnection(databaseName: string) {
    const mongoDatabaseUrl = `mongodb://${hostname}:${port}/${databaseName}`;
    logger('database-manager').info(`Creating a connection to ${mongoDatabaseUrl}.`);

    const conn = mongoose.createConnection(mongoDatabaseUrl, options);

    conn.then(
        (connection) => {
            logger('database-manager').info('Connected to DB.');
            return connection;
        },
        (err: any) => {
            logger('database-manager').error(`Failed to create a connection to DB: ${err.toString()}`);
            logger('database-manager').error('Exiting.');

            process.exit(-1);
        }
    );

    return conn;
}

module.exports = (databaseName: string) => {
    if (!databases_.has(databaseName)) {
        databases_.set(databaseName, createNewConnection(databaseName));
    }

    return databases_.get(databaseName);
};
