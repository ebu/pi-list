const topics = {
    nmos: {
        sender_list_update: "amq.topic.stream_updates"
    }
};

const anySubtopic = topic => topic + '.*';
const makeSubtopic = (topic, subTopic) => topic + '.' + subTopic;

module.exports = {
    topics,
    anySubtopic,
    makeSubtopic
};
