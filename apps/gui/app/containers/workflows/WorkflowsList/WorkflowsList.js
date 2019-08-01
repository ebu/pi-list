import React, { useEffect, useReducer } from 'react';
import Toolbar from './Toolbar';
import WorkflowsTable from './WorkflowsTable';
import Actions from './Actions';
import { reducer } from './reducer';
import { middleware } from './middleware';
import {
    tableInitialState,
    tableReducer,
} from '../../../utils/models/table/tableReducer';
import tableactions from '../../../utils/models/table/actions';
import api from '../../../utils/api';
import { useMqttMessages } from '../../../utils/mqtt';
import mqtypes from 'ebu_list_common/mq/types';

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(tableReducer(state, action), action);
};
const initialState = {
    ...tableInitialState(),
};

const WorkflowsList = () => {
    const [state, dispatch] = useReducer(actionsWorkflow, initialState);
    const toggleRow = id =>
        dispatch({ type: tableactions.toggleRow, data: { id } });
    const toggleSelectAll = () =>
        dispatch({ type: tableactions.toggleSelectAll });
    const onClickRow = () => {};

    const onMessage = (topic, message) => {
        dispatch({
            type: Actions.updateWorkflows,
            payload: message,
        });
    };

    useEffect(() => {
        const disconnect = useMqttMessages(
            mqtypes.exchanges.mqtt.topics.workflows.update,
            onMessage
        );

        api.getWorkflows().then(data => {
            dispatch({
                type: Actions.updateWorkflows,
                payload: { added: data, removedIds: [] },
            });
        });

        return disconnect;
    }, []);

    return (
        <div>
            <Toolbar dispatch={dispatch} selectedItems={state.selected} />
            <WorkflowsTable
                data={state.data}
                selectedIds={state.selected}
                selectAll={state.selectAll}
                onSelectId={toggleRow}
                onSelectAll={toggleSelectAll}
                onClickRow={onClickRow}
            />
        </div>
    );
};

export default WorkflowsList;
