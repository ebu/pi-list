const EventEmitter = require('events');
const axios = require('axios');
const _ = require('lodash');
const logger = require('../util/logger');
const websocketManager = require('../managers/websocket');
const program = require('../util/programArguments');

const updateEvent = 'updateEvent';

const is04_query_static_url = _.get(program, [
    'nmos',
    'is04',
    'query',
    'static',
    'rootUrl',
]);
const version = '1.2';

if (!is04_query_static_url) {
    logger('nmos-crawler').info(
        'No static configuration defined. No IS-04 registry.'
    );
    return;
}

const query_url = `${is04_query_static_url}/x-nmos/query/v${version}`;

const intervalToUpdate = 1000;

const getIds = data => new Set(data.map(d => d.id));
const difference = (sa, sb) => [...sa].filter(x => !sb.has(x));

const calculateDelta = (prev, current) => {
    const prevIds = getIds(prev);
    const currentIds = getIds(current);
    const removedIds = difference(prevIds, currentIds);
    const addedIds = difference(currentIds, prevIds);

    return { addedIds, removedIds };
};

const getAdditionalSenderData = sender => {
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

const getAdditionalSendersData = senders =>
    Promise.all(senders.map(sender => getAdditionalSenderData(sender)));

const makeIs04Manager = () => {
    let senders = [];

    const onUpdate = new EventEmitter();
    const getSenders = () => senders;

    const onSendersData = data => {
        const newSenders = _.cloneDeep(data);
        const { addedIds, removedIds } = calculateDelta(senders, newSenders);

        const addedIdsSet = new Set(addedIds);
        getAdditionalSendersData(
            newSenders.filter(sender => addedIdsSet.has(sender.id))
        )
            .then(addedSenders => {
                if (addedIds.length !== 0 || removedIds.length !== 0) {
                    const data = { added: addedSenders, removedIds };
                    onUpdate.emit(updateEvent, data);
                }
                senders = newSenders;
            })
            .catch(err => console.log('Error getting senders:', err));
    };

    const setTimer = () => {
        setTimeout(checkRegistry, 1000);
    };

    const checkRegistry = () => {
        // logger('nmos-crawler').info('Checking registry for senders');
        const query_all_senders_url = `${query_url}/senders`;

        axios
            .get(query_all_senders_url)
            .then(response => {
                setTimer();

                if (!response.data) {
                    return;
                }

                onSendersData(response.data);
            })
            .catch(error => {
                console.log(error);
                setTimer();
            });
    };

    checkRegistry();

    return { getSenders, onUpdate };
};

const { getSenders, onUpdate } = makeIs04Manager();

module.exports = {
    getSenders,
    onUpdate,
    events: {
        updateEvent,
    },
};
