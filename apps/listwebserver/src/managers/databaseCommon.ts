import programArguments from '../util/programArguments';

export const options = {
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    useFindAndModify: false,
    useNewUrlParser: true,
};

export const { hostname, port } = programArguments.database;
