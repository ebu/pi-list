const mongoose = require('mongoose');
const programArguments = require('../util/programArguments');
const User = require('../models/user');
const logger = require('../util/logger');

class DatabaseManager {
    constructor(databaseHostname, databasePort) {
        const mongoDatabaseUrl = `mongodb://${databaseHostname}:${databasePort}/list`;

        logger('database-manager').info(`Initializing database manager at ${mongoDatabaseUrl}.`);

        const options = {
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 500, // Reconnect every 500ms
        };

        mongoose.connect(mongoDatabaseUrl, options).then(
            () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
            err => {
                logger('database-manager').error(`Cannot connect to ${mongoDatabaseUrl}: ${err}.`);
            }
        );

    }

    close() {
        logger('database-manager').info('Mongo DB connection disconnected.');
        mongoose.connection.close();
    }

    saveUser(userObject) {
       return User.create(userObject);
    }

    findUserByEmail(email) {
        return User.findOne({ email });
    }

    deleteUserById(id) {
        return User.remove({ id });
    }
}

const { hostname, port } = programArguments.database;

module.exports = new DatabaseManager(hostname, port);
