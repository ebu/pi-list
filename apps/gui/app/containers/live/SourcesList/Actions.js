const Actions = {
    setSources: 'setSources', // payload: { sources : [ Source ] },
    updateSources: 'updateSources', // payload: <same as MQ event for topics.nmos.sender_list_update>,
    deleteLiveSources: 'deleteLiveSources', // payload: { ids : [ String ] },
};

export default Actions;
