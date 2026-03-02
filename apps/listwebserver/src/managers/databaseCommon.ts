import programArguments from '../util/programArguments';

// Mongoose 6.x compatible options
export const options = {
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
};

export const { hostname, port } = programArguments.database;
