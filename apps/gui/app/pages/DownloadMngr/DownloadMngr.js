import React, { useEffect, useReducer } from 'react';
import DownloadMngrTable from './DownloadMngrTable';
import api from '../../utils/api';
import Actions from './state/Actions';
import { reducer } from './state/reducer';

const withMiddleware = (state, action) => {
    return reducer(state, action);
};

const initialState = {
    data: [],
};

const DownloadMngr = () => {
    const [state, dispatch] = useReducer(withMiddleware, initialState);

    useEffect(() => {
        api.getDownloads().then(content => {
            dispatch({
                type: Actions.setDownloadMngr,
                payload: { data: content.data },
            });
        });
    }, []);

    return (
        <div>
            <DownloadMngrTable data={state.data} />
        </div>
    );
};

export default DownloadMngr;
