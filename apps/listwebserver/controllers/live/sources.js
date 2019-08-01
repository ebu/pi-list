const axios = require('axios');
const _ = require('lodash');
const uuidv1 = require('uuid/v1');
const {
    createExchangeSender,
} = require('../../../../js/common_server/mq/send');
const { kinds, formats } = require('../../../../js/common/capture/sources');
const mqtypes = require('../../../../js/common/mq/types');
const logger = require('../../util/logger');
const { getIpInfoFromSdp, getMediaSpecificMeta } = require('../../util/sdp');
const sdpParser = require('sdp-transform');
const LiveSource = require('../../models/liveSource');
const programArguments = require('../../util/programArguments');

let nmosSources = [];
const mqttSender = createExchangeSender(
    programArguments.rabbitmqUrl,
    mqtypes.exchanges.mqtt
);
const sendMqttUpdate = payload =>
    mqttSender.send({
        key: mqtypes.exchanges.mqtt.topics.nmos.sender_list_update,
        msg: payload,
    });

const getMetaForNmosSource = source => ({
    label: _.get(source, ['nmos', 'sender', 'label']),
    format: _.get(source, ['nmos', 'sender', 'flow', 'format']),
});

const getMetaForUserDefinedSource = source => {
    const meta = {
        ...source.meta,
    };

    return meta;
};

const getLiveSources = async () => {
    const local = await LiveSource.find().exec();
    return [...local, ...nmosSources];
};

function addLiveSource(_source) {
    logger('live-sources').info(
        `Adding source - id: ${_source.id}, kind: ${_source.kind}`
    );
    const source = _.cloneDeep(_source);
    if (source.id === undefined) {
        source.id = uuidv1();
    }

    source.meta = getMetaForUserDefinedSource(source);

    new LiveSource(source).save();

    const changeSet = {
        added: [source],
        removedIds: [],
    };

    sendMqttUpdate(changeSet);

    return Promise.resolve(source);
}

function deleteLiveSources(ids) {
    ids.forEach(async id => {
        await LiveSource.deleteOne({ id: id }).exec();
    });

    const changeSet = {
        added: [],
        removedIds: ids,
    };

    sendMqttUpdate(changeSet);

    return Promise.resolve({ ids });
}

// returns a promise that resolves to a source
async function mapAddedNmosToSource(sender) {
    const source = {
        id: sender.id,
        kind: kinds.nmos,
        nmos: {
            sender,
        },
        meta: {},
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
        source.sdp = { raw: response.data.toString() };
        const parsed = sdpParser.parse(source.sdp.raw);
        source.sdp.parsed = parsed;

        const sdpStreams = getIpInfoFromSdp(parsed);
        source.sdp.streams = sdpStreams;

        if (!parsed.media || parsed.media.length === 0) {
            logger('sdp-controller').error('SDP has no media entries');
            return source;
        }

        const media = parsed.media[0];
        const ssMeta = getMediaSpecificMeta(media);
        const nmMeta = getMetaForNmosSource(source);

        source.meta = {
            ...ssMeta,
            ...nmMeta,
        };
    } catch (err) {
        logger('live-sources').error(`Error getting SDP file: ${err.message}`);
    }

    return source;
}

const { events, onUpdate } = require('../../worker/nmosRegistryProxy');
if (!onUpdate) {
    logger('live-sources').info('No NMOS querier');
    return;
}

const onChanged = ({ added, removedIds }) => {
    const removedIdsSet = new Set(removedIds);

    const notRemoved = nmosSources.filter(s => !removedIdsSet.has(s.id));

    const addedSourcesPromises = added.map(a => mapAddedNmosToSource(a));

    Promise.all(addedSourcesPromises).then(addedSources => {
        nmosSources = [...notRemoved, ...addedSources];

        const changeSet = {
            added: addedSources,
            removedIds: removedIds,
        };

        sendMqttUpdate(changeSet);
    });
};

onUpdate.on(events.updateEvent, onChanged);

const findLiveSources = async wantedIds => {
    const sources = await getLiveSources();
    return sources.filter(source => wantedIds.includes(source.id));
};

module.exports = {
    getLiveSources,
    findLiveSources,
    addLiveSource,
    deleteLiveSources,
};
