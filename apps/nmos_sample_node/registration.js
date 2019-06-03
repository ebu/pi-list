const axios = require('axios');
const logger = require('./logger');

async function doRegister(registrationUrl, data) {
    logger('server').info(`Registering ${data.type}`);
    return axios
        .post(`${registrationUrl}/resource`, data)
        .then(res => {
            logger('registration').info(`Registered ${data.type}`);
        })
        .catch(err => {
            logger('registration').error(
                `Registration failed for ${data.type}: ${
                    err.response.data.error
                }`
            );
        });
}

async function doUnregister(registrationUrl, kind, id) {
    const url = `${registrationUrl}/resource/${kind}/${id}`;
    logger('server').info(`Unregistering ${kind} at ${url}`);
    return axios
        .delete(url)
        .then(res => {
            logger('registration').info(`Unregistered ${kind}`);
        })
        .catch(err => {
            logger('registration').error(
                `Unegistration failed for ${kind}: ${
                    err.response.data.error
                }`
            );
        });
}

async function registerNode(registrationUrl, state) {
    const register = d => doRegister(registrationUrl, d);

    await register(state.node);
    await register(state.device);
    await register(state.source);
    await register(state.flow);
    return await register(state.sender);
}

async function unregisterNode(registrationUrl, state) {
    const unregister = (kind, id) => doUnregister(registrationUrl, kind, id);

    await unregister('senders', state.sender.data.id);
    await unregister('flows', state.flow.data.id);
    await unregister('sources', state.source.data.id);
    await unregister('devices', state.device.data.id);
    await unregister('nodes', state.node.data.id);
}

const makeHeartbeat = (registrationUrl, nodeId) => async () => {
    const data = {
        health: '1441974485',
    };

    const url = `${registrationUrl}/health/nodes/${nodeId}`;

    return await axios
        .post(url, data)
        .then(response => {
            logger('registration').info(`Heartbeat accepted for ${nodeId}`);
            return response;
        });
};

module.exports = {
    registerNode,
    unregisterNode,
    makeHeartbeat,
};
