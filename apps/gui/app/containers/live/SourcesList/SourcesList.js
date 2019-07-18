import React, { useEffect, useReducer } from 'react';
import Toolbar from './Toolbar';
import SourcesTable from './SourcesTable';
import Actions from './Actions';
import { reducer } from './reducer';
import { middleware } from './middleware';
import {
    tableInitialState,
    tableReducer,
} from '../../../utils/models/table/tableReducer';
import tableactions from '../../../utils/models/table/actions';
import routeBuilder from '../../../utils/routeBuilder';
import DeleteModal from '../../../components/DeleteModal';
import { useMqttMessages } from '../../../utils/mqtt';
import mqtypes from '../../../common/mq/types';
import api from '../../../utils/api';

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(tableReducer(state, action), action);
};

const SourcesList = props => {
    const [state, dispatch] = useReducer(actionsWorkflow, tableInitialState());
    const toggleRow = id => dispatch({ type: tableactions.toggleRow, data: { id } });
    const toggleSelectAll = () => dispatch({ type: tableactions.toggleSelectAll });
    const onClickRow = id => {
        // const route = routeBuilder.live_flow_page(id);
        // window.appHistory.push(route);
    };

    const onMessage = (topic, message) => {
        dispatch({
            type: Actions.updateSources,
            payload: message,
        });
    };

    useEffect(() => {
        const disconnect = useMqttMessages(
            mqtypes.topics.nmos.sender_list_update,
            onMessage
        );

        api.getLiveSources().then(data => {
            dispatch({
                type: Actions.updateSources,
                payload: { added: data, removed: [] },
            });
        });

        return disconnect;
    }, []);

    const doDelete = idsToDelete => {
        dispatch({ type: tableactions.requestDelete, data: { ids: [] } });

        if (idsToDelete.length === 0) return;

        dispatch({ type: tableactions.clearSelection });

        // TODO: refactor this to delete all with a single call
        dispatch({
            type: Actions.deleteLiveSources,
            payload: { ids: idsToDelete },
        });
    };

    return (
        <div>
            <DeleteModal
                label="live.sources.delete_header"
                message="live.sources.delete_message"
                data={state.itemsToDelete}
                onDelete={doDelete}
            />
            <Toolbar dispatch={dispatch} selectedItems={state.selected} />
            <SourcesTable
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

export default SourcesList;
