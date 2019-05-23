const Actions = {
    selectBefore: 'selectBefore', // data: { id : String }
    selectAfter: 'selectAfter', // data: { id : String }
    clearSelection: 'clearSelection',
    toggleRow: 'toggleRow', // data: { id : String }
    toggleSelectAll: 'toggleSelectAll',
    pcapReceived: 'pcapReceived', // data: { pcap : {} }
    pcapProcessed: 'pcapProcessed',
    pcapFailed: 'pcapFailed',
    pcapDone: 'pcapDone',
    requestDelete: 'requestDelete', // data: { ids : [ String ] }
    deletePcap: 'deletePcap', // data: { id : String },
    pcapDeleted: 'pcapDeleted', // data: { id : String },
    downloadSelectedPcap: 'downloadSelectedPcap', // data: { ids : [ String ] },
    downloadSelectedSdp: 'downloadSelectedSdp', // data: { ids : [ String ] },
    downloadSelectedReport: 'downloadSelectedReport', // data: { ids : [ String ] },
};

export default Actions;
