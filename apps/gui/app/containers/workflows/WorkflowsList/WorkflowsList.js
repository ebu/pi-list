import React, { useEffect, useReducer } from 'react';
import _ from 'lodash';
import mqtypes from 'ebu_list_common/mq/types';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';
import wfSchema from 'ebu_list_common/workflows/schema';
import Toolbar from './Toolbar';
import WorkflowsTable from './WorkflowsTable';
import Actions from './Actions';
import { reducer } from './reducer';
import { middleware } from './middleware';
import { tableInitialState, makeTableReducer } from '../../../utils/models/table/tableReducer';
import tableactions from '../../../utils/models/table/actions';
import api from '../../../utils/api';
import { useMqttMessages } from '../../../utils/mqtt';
import notifications from '../../../utils/notifications';

const tableReducer = makeTableReducer();

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(tableReducer(state, action), action);
};
const initialState = {
    ...tableInitialState(),
};

const WorkflowsList = () => {
    const [state, dispatch] = useReducer(actionsWorkflow, initialState);

    const toggleRow = id => dispatch({ type: tableactions.toggleRow, data: { id } });
    const toggleSelectAll = () => dispatch({ type: tableactions.toggleSelectAll });
    const getVisible = (rows) => { state.visible = rows.map(e => e._original); };
    // const onClickRow = () => {};

    const onMessage = (topic, message) => {
        dispatch({
            type: Actions.updateWorkflows,
            payload: message,
        });
    };

    useEffect(() => {
        const disconnect = useMqttMessages(mqtypes.exchanges.mqtt.topics.workflows.update, onMessage);

        api.getWorkflows().then(data => {
            dispatch({
                type: Actions.updateWorkflows,
                payload: { added: data, removedIds: [] },
            });
        });

        return disconnect;
    }, []);

    const onToolBarRequestCancel = data => {
        dispatch({
            type: tableactions.requestCancel,
            data: { ids: data },
        });
    };

    useEffect(() => {
        if (state.cancelRequestIds.length > 0) {
            // Select only the ones that are eligible to be cancelled
            const elegibleToCancel = state.data
                .filter(
                    item =>
                        item.state.status !== wfSchema.status.canceled &&
                        item.state.status !== wfSchema.status.failed &&
                        item.state.status !== wfSchema.status.completed
                )
                .map(item => item.id);

            const common = _.intersection(state.cancelRequestIds, elegibleToCancel);
            // Notify that some of them are not elegible, maybe a wrong selection
            if (common.length !== state.cancelRequestIds.length) {
                notifications.warn({
                    titleTag: 'workflow.cancel_not_eligible_title',
                    messageTag: 'workflow.cancel_not_eligible',
                });

                return;
            }

            const workflowInfo = {
                type: workflowTypes.captureAndIngest,
                configuration: {
                    ids: elegibleToCancel,
                },
            };

            api.cancelWorkflow(workflowInfo)
                .then(() => {
                    notifications.success({
                        titleTag: 'workflow.cancel_requested',
                        messageTag: 'workflow.cancel_requested',
                    });
                })
                .catch(() => {
                    notifications.error({
                        titleTag: 'workflow.cancel_failed',
                        messageTag: 'workflow.cancel_failed',
                    });
                });
        }
    }, [state.cancelRequestIds]);

    return (
        <div>
            <Toolbar cbFunction={onToolBarRequestCancel} selectedItems={state.selected} />
            <WorkflowsTable
                data={state.data}
                selectedIds={state.selected}
                selectAll={state.selectAll}
                onSelectId={toggleRow}
                onSelectAll={toggleSelectAll}
                onClickRow={toggleRow}
                getVisible={getVisible}
            />
        </div>
    );
};

export default WorkflowsList;
