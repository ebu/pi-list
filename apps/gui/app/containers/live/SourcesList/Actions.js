const Actions = {
    setSources: 'setSources', // payload: { sources : [ Source ] },
    updateSources: 'updateSources', // payload: <same as MQ event for topics.nmos.sender_list_update>,
    deleteLiveSources: 'deleteLiveSources', // payload: { ids : [ String ] },
    
    // payload: { 
    //      ids : [ String ] },
    //      filename : [ String ] },
    //      durationMs : [ String ] },
    captureFromSources: 'captureFromSources',
    
    showAddSource: 'showAddSource',
    hideAddSource: 'hideAddSource',
    showStartCapture: 'showStartCapture',
    hideStartCapture: 'hideStartCapture',
    addSources: 'addSources', // payload: { sources: [ { dstAddr, dstPort } ] },
};

export default Actions;
