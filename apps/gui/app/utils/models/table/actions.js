const actions = {
    clearSelection: 'clearSelection',
    toggleRow: 'toggleRow', // data: { id : String }
    toggleSelectAll: 'toggleSelectAll',
    requestDelete: 'requestDelete', // data: { ids : [ String ] }
    setFilterString: 'setFilterString', // payload: { value : String },
    showSDPErrorPopUp: 'showSDPErrorPopUp', // data: { id : String }
    hideSDPErrorPopUp: 'hideSDPErrorPopUp',

};

export default actions;
