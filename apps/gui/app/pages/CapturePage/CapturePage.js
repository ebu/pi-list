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
        <div>
            <div className="row">
                <div className="col-xs-6">
                    <SourcesList onSelectedSendersChanged={onChange} />
                </div>
                <div className="col-xs-6">
                    <CapturePanel dispatch={dispatch} sources={selected} visible={true}/>
                    <WorkflowsList />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <PcapList />
                </div>
            </div>
        </div>
    );
};

export default CapturePage;
