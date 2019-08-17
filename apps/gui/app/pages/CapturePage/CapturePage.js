import React, { useReducer, useState } from 'react';
import { reducer } from './reducer';
import { middleware } from './middleware';
import WorkflowsList from '../../containers/workflows/WorkflowsList';
import SourcesList from '../../containers/live/SourcesList';
import CapturePanel from './CapturePanel';
import PcapList from '../../containers/PcapList';

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(state, action);
};

const initialState = {};

const CapturePage = props => {
    const [state, dispatch] = useReducer(actionsWorkflow, initialState);

    const [selected, setSelected] = useState([]);

    const onChange = ({ selectedSources }) => {
        setSelected(selectedSources);
    };

    return (
        <div className="row">
            <div className="col-xs-8">
                <SourcesList onSelectedSendersChanged={onChange} />
                <PcapList />
            </div>
            <div className="col-xs-4">
                <CapturePanel dispatch={dispatch} sources={selected} />
                <WorkflowsList />
            </div>
        </div>
    );
};

export default CapturePage;
{
    /* <StartCaptureModal
visible={state.startCaptureModalVisible}
/> */
}
