const EventEmitter = require('events');
const axios = require('axios');
const _ = require('lodash');
const logger = require('../util/logger');
const websocketManager = require('../managers/websocket');
const program = require('../util/programArguments');
const WebSocketClient = require('websocket').client;
const W3CWebSocket = require('websocket').w3cwebsocket;
const webSocketMonitor = require('./webSocketMonitor');

const updateEvent = 'updateEvent';

const is04_query_static_url = _.get(program, [
    'nmos',
    'is04',
    'query',
    'static',
    'rootUrl',
]);
const version = '1.2';

const query_url = is04_query_static_url
    ? `${is04_query_static_url}/x-nmos/query/v${version}`
    : null;

const getAdditionalSenderData = async (sender) => {
    return new Promise((resolve, reject) => {
        const flowUrl = `${query_url}/flows/${sender.flow_id}`;
        const deviceUrl = `${query_url}/devices/${sender.device_id}`;

        axios
            .all([axios.get(flowUrl), axios.get(deviceUrl)])
            .then(
                axios.spread((flow, device) => {
                    sender.flow = flow.data;
                    sender.device = device.data;

                    resolve(sender);
                })
            )
            .catch(error => {
                reject(error);
            });
    });
};

const makeIs04Manager = () => {
    if (query_url === null) {
        logger('nmos-crawler').info(
            'No static configuration defined. No IS-04 registry.'
        );

        return {
            getSenders: () => [],
            onUpdate: new EventEmitter(),
        };
    }

    let senders = [];
    const onUpdate = new EventEmitter();

    const appendSender = async (sender) => {
        logger('nmos-crawler').info(`Appending sender ${sender.id}.`);

        await getAdditionalSenderData(sender);

        senders.push(sender);

        const data = { added: [sender], removedIds: [] };
        onUpdate.emit(updateEvent, data);
    };

    const removeSender = senderId => {
        logger('nmos-crawler').info(`Removing sender ${senderId}.`);

        senders = senders.filter(s => s.id !== senderId);
        
        const data = { added: [], removedIds: [senderId] };
        onUpdate.emit(updateEvent, data);
    };

    const handleCreate = async ({ post }) => {
        await appendSender(post);
    };

    const handleDelete = ({ pre }) => {
        removeSender(pre.id);
    };

    const handleUpdate = async ({ pre, post }) => {
        removeSender(pre.id);
        await appendSender(post);
    };

    const createResult = webSocketMonitor.createMonitor(query_url);
    const wsEvents = createResult.eventEmitter;
    wsEvents.on(webSocketMonitor.events.create, handleCreate);
    wsEvents.on(webSocketMonitor.events.delete, handleDelete);
    wsEvents.on(webSocketMonitor.events.update, handleUpdate);

    ///////////////////////////////////////////////////

    return {
        getSenders: () => senders,
        onUpdate,
    };
};

const { getSenders, onUpdate } = makeIs04Manager();

module.exports = {
    getSenders,
    onUpdate,
    events: {
        updateEvent,
    },
};
