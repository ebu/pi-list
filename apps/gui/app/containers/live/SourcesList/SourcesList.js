import React, { useEffect, useReducer, useState } from 'react';
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
import mqtypes from 'ebu_list_common/mq/types';
import api from '../../../utils/api';
import DragAndDropUploader from '../../../components/upload/DragAndDropUploader';
import { translateX } from '../../../utils/translation';
import AddSourceModal from './AddSourceModal';

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(tableReducer(state, action), action);
};
const initialState = {
    ...tableInitialState(),
    addSourceModalVisible: false,
};

const SourcesList = props => {
    const [state, dispatch] = useReducer(actionsWorkflow, initialState);
    const toggleRow = id =>
        dispatch({ type: tableactions.toggleRow, data: { id } });
    const toggleSelectAll = () =>
        dispatch({ type: tableactions.toggleSelectAll });
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
            mqtypes.exchanges.mqtt.topics.nmos.sender_list_update,
            onMessage
        );

        api.getLiveSources().then(data => {
            dispatch({
                type: Actions.updateSources,
                payload: { added: data, removedIds: [] },
            });
        });

        return disconnect;
    }, []);

    const doDelete = idsToDelete => {
        dispatch({ type: tableactions.requestDelete, data: { ids: [] } });

        if (idsToDelete.length === 0) return;

        dispatch({ type: tableactions.clearSelection });

        dispatch({
            type: Actions.deleteLiveSources,
            payload: { ids: idsToDelete },
        });
    };

    const onUpload = async (data, onComplete) => {
        try {
            const sourceResponse = await api.sdpToSource(data, onComplete);
            const source = sourceResponse.data.source;
            const addedSource = await api.addLiveSource(source);
        } catch (err) {
            // TODO: show this to user
            console.error('error adding source from SDP', err);
        }
    };

    const onModalClose = () => dispatch({ type: Actions.hideAddSource });
    const onModalAddSources = sources =>
        dispatch({ type: Actions.addSources, payload: { sources } });

    return (
        <div>
            <DeleteModal
                label="live.sources.delete_header"
                message="live.sources.delete_message"
                data={state.itemsToDelete}
                onDelete={doDelete}
            />
            <DragAndDropUploader
                uploadButtonLabel="SDP"
                uploadApi={onUpload}
                title={translateX('navigation.live_sources')}
            >
                <Toolbar dispatch={dispatch} selectedItems={state.selected} />
                <SourcesTable
                    data={state.data}
                    selectedIds={state.selected}
                    selectAll={state.selectAll}
                    onSelectId={toggleRow}
                    onSelectAll={toggleSelectAll}
                    onClickRow={onClickRow}
                />
            </DragAndDropUploader>
            <AddSourceModal
                visible={state.addSourceModalVisible}
                onAdd={onModalAddSources}
                onClose={onModalClose}
            />
        </div>
    );
};

export default SourcesList;
