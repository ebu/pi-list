const anySubtopic = (topic) => topic + '.*';
const makeSubtopic = (topic, subTopic) => topic + '.' + subTopic;

const queues = {
    /* Schema:
    {
        action: "preprocessing.request",
        workflow_id: "<>",
        pcap_id: "<>",
        pcap_path: "<path to pcap>"
    }
    */
    preprocessorRequest: {
        name: 'ebu-list.preprocessor.request',
        options: {
            durable: true,
        },
    },

    workflowRequest: {
        name: 'ebu-list.workflow.request',
        options: {
            durable: true,
        },
    },

    /* Schema:
    {
        id: string (workflow id)
        status: string (see workflows.schema.status)
        payload:
            - if status == failed, string (error message)
    }
    */
    workflowStatus: {
        name: 'ebu-list.workflow.status',
        options: {
            durable: true,
        },
    },
};

const exchanges = {
    mqtt: {
        name: 'amq.topic',
        type: 'topic',
        topics: {
            workflows: {
                /* payload:
                {
                    added: undefined | [wf],
                    removedIds: undefined | [string],
                    updated: undefined | [wf],
                }
                */
                update: 'amq.topic.workflows.update',
                cancel: 'amq.topic.workflows.cancel',
            },
            nmos: {
                /* payload:
                {
                    added: undefined | [sender],
                    removedIds: undefined | [string],
                    updated: undefined | [sender],
                }
                */
                sender_list_update: 'amq.topic.stream_updates',
            },
        },
    },

    probeStatus: {
        name: 'ebu-list.probe',
        type: 'fanout',
        options: {
            durable: false,
        },
        keys: {
            /**
             * Announce message:
             * {
             *   probe: {
             *     id : string // probe's unique id
             *     label : string // Human readable probe name
             *   }
             * }
             */
            announce: 'announce',
        },
    },

    liveStreamUpdates: {
        name: 'stream_info',
        type: 'topic',
        options: {
            durable: false,
        },
        topics: {
            stream_update: 'stream_update',
        },
    },

    preprocessorStatus: {
        name: 'ebu-list.preprocessor.status',
        type: 'fanout',
        options: { durable: false },
        keys: { announce: 'announce' },
    },

    extractorStatus: {
        name: 'ebu-list.extractor.status',
        type: 'fanout',
        options: { durable: false },
        keys: { progress: 'progress' },
    },
};

module.exports = {
    queues,
    exchanges,
    anySubtopic,
    makeSubtopic,
};
