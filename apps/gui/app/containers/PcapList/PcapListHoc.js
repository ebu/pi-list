import React, { useReducer } from 'react';
import { StateContext } from './Context';
import PcapList from './PcapList';
import asyncLoader from '../../components/asyncLoader';
import api from '../../utils/api';
import PcapWsEventListener from './PcapWsEventListener';
import { addStateToPcapInfo } from './utils';

import { reducer } from './reducer';
import { middleware } from './middleware';

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(state, action);
};

const PcapListHoc = (props) => {
    const initialState = {
        selected: [],
        selectAll: 0,
        data: props.pcaps.map(addStateToPcapInfo),
        itemsToDelete: [],
    };

    return (
        <StateContext.Provider value={useReducer(actionsWorkflow, initialState)}>
            <PcapWsEventListener>
                <PcapList />
            </PcapWsEventListener>
        </StateContext.Provider>
    );
};

export default asyncLoader(PcapListHoc, {
    asyncRequests: {
        pcaps: () => api.getPcaps()
    }
});
