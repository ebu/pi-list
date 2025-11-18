import mongoose from 'mongoose';
import logger from '../util/logger';
import { hostname, options, port } from './databaseCommon';

async function doTestConnection(mongoDatabaseUrl: string): Promise<boolean> {
    try {
        const conn = mongoose.createConnection(mongoDatabaseUrl, options);
        // Wait for connection to be established
        await conn.asPromise();
        await conn.close();
        return true;
    } catch (err) {
        return false;
    }
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForDb() {
    const databaseName = 'offline';
    const mongoDatabaseUrl = `mongodb://${hostname}:${port}/${databaseName}`;
    logger('database-manager').info(`Creating a connection to ${mongoDatabaseUrl}.`);

    while (!(await doTestConnection(mongoDatabaseUrl))) {
        logger('database-manager').info('Waiting for database');
        await delay(1000);
    }
}
