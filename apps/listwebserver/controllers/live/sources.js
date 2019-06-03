const axios = require('axios');
const { createMQTTSender } = require('../../util/mq');
const { kinds } = require('../../common/capture/sources');
const mqtypes = require('../../common/mq/types');
const logger = require('../../util/logger');
const { getIpInfoFromSdp } = require('../../util/sdp');

let sources = [];

function getLiveSources() {
    return Promise.resolve(sources);
}

let sendMqtt = undefined;

function deleteLiveSources(ids) {
    sources = sources.filter(s => !ids.includes(s.id));

    if (sendMqtt) {
        const changeSet = {
            added: [],
            removedIds: ids,
        };

        sendMqtt(mqtypes.topics.nmos.sender_list_update, changeSet);
    }

    return Promise.resolve({ ids });
}

// returns a promise that resolves to a source
async function mapAddedToSource(sender) {
    const source = {
        id: sender.id,
        label: sender.label,
        kind: kinds.nmos,
        nmos: {
            sender: sender,
            sdp: undefined,
        },
    };

    try {
        const url = sender.manifest_href;
        if (sender.manifest_href === undefined) {
            logger('live-sources').error(
                `No manifest_href for sender with id ${sender.id}`
            );
            return source;
        }

        const getConfig = { timeout: 1000 };
        const response = await axios.get(url, getConfig);
        source.sdp = { data: response.data };

        const sdpStreams = getIpInfoFromSdp(source.sdp.data);
        source.sdp.streams = sdpStreams;
    } catch (err) {
        logger('live-sources').error(`Error getting SDP file: ${err.message}`);
    }

    return source;
}

const { events, onUpdate } = require('../../worker/nmosRegistryProxy');

const senderPromise = createMQTTSender();
senderPromise.then(({ send }) => {
    sendMqtt = send;

    const onChanged = ({ added, removedIds }) => {
        const removedIdsSet = new Set(removedIds);

        const notRemoved = sources.filter(s => !removedIdsSet.has(s.id));

        const addedSourcesPromises = added.map(a => mapAddedToSource(a));

        Promise.all(addedSourcesPromises).then(addedSources => {
            sources = [...notRemoved, ...addedSources];

            const changeSet = {
                added: addedSources,
                removedIds: removedIds,
            };
            send(mqtypes.topics.nmos.sender_list_update, changeSet);
        });
    };

    onUpdate.on(events.updateEvent, onChanged);
});

module.exports = {
    getLiveSources,
    deleteLiveSources,
};
