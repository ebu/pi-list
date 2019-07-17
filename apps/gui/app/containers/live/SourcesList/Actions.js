const Actions = {
    setSources: 'setSources', // payload: { sources : [ Source ] },
    updateSources: 'updateSources', // payload: <same as MQ event for topics.nmos.sender_list_update>,
    deleteLiveSources: 'deleteLiveSources', // payload: { ids : [ String ] },
    captureFromSources: 'captureFromSources', // payload: { ids : [ String ] },
    showAddSource: 'showAddSource',
    hideAddSource: 'hideAddSource',
    addSources: 'addSources', // payload: { sources: [ { dstAddr, dstPort } ] },
};

export default Actions;
