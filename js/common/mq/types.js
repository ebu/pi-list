const topics = {
    nmos: {
        sender_list_update: 'amq.topic.stream_updates',
    },
};

const anySubtopic = topic => topic + '.*';
const makeSubtopic = (topic, subTopic) => topic + '.' + subTopic;

const queues = {
    workflowRequest: {
        name: 'ebu-list.workflow.request',
        options: {
            durable: true,
        },
    },
    workflowStatus: {
        name: 'ebu-list.workflow.status',
        options: {
            durable: true,
        },
    },
};

const exchanges = {
    probeStatus: 'ebu-list.probe',
};

const keys = {
    probeStatus: {
        announce: 'announce',
    }
};

module.exports = {
    queues,
    exchanges,
    topics,
    keys,
    anySubtopic,
    makeSubtopic,
};
