import tableActions from '../../utils/models/table/actions';

const Actions = {
    ...tableActions,
    selectBefore: 'selectBefore', // data: { id : String }
    selectAfter: 'selectAfter', // data: { id : String }
    pcapReceived: 'pcapReceived', // data: { pcap : {} }
    pcapProcessed: 'pcapProcessed',
    pcapFailed: 'pcapFailed',
    pcapDone: 'pcapDone',
    deletePcap: 'deletePcap', // data: { id : String },
    pcapDeleted: 'pcapDeleted', // data: { id : String },
    downloadSelectedPcap: 'downloadSelectedPcap', // data: { ids : [ String ] },
    downloadSelectedSdp: 'downloadSelectedSdp', // data: { ids : [ String ] },
    downloadSelectedReport: 'downloadSelectedReport', // data: { ids : [ String ] },
};

export default Actions;
