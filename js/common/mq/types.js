const anySubtopic = topic => topic + '.*';
const makeSubtopic = (topic, subTopic) => topic + '.' + subTopic;

const queues = {
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
            // TODO: add topics here
        }
    },
};

module.exports = {
    queues,
    exchanges,
    anySubtopic,
    makeSubtopic,
};
