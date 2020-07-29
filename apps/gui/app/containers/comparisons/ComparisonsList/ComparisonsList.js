import React, { useEffect, useReducer } from 'react';
import mqtypes from 'ebu_list_common/mq/types';
import DeleteModal from '../../../components/DeleteModal';
import { tableInitialState, makeTableReducer } from '../../../utils/models/table/tableReducer';
import tableactions from '../../../utils/models/table/actions';
import routeBuilder from '../../../utils/routeBuilder';
import api from '../../../utils/api';
import { useMqttMessages } from '../../../utils/mqtt';
import notifications from '../../../utils/notifications';
import { translate } from '../../../utils/translation';
import websocket from '../../../utils/websocket';
import websocketEventsEnum from '../../../enums/websocketEventsEnum';
import Toolbar from './Toolbar';
import ComparisonsTable from './ComparisonsTable';
import Actions from './Actions';
import { reducer } from './reducer';
import { middleware } from './middleware';

const tableReducer = makeTableReducer();

const actionsComparisons = (state, action) => {
    middleware(state, action);
    return reducer(tableReducer(state, action), action);
};
const initialState = {
    ...tableInitialState(),
};

const ComparisonsList = () => {
    const [state, dispatch] = useReducer(actionsComparisons, initialState);

    const toggleRow = id => dispatch({ type: tableactions.toggleRow, data: { id } });
    const toggleSelectAll = () => dispatch({ type: tableactions.toggleSelectAll });
    const getVisible = (rows) => { state.visible = rows.map(e => e._original); };

    const onMessage = (topic, message) => {
        console.log(`Stream compare: on MQTT message: ${message}`);
        api.getComparisons().then(data => {
            dispatch({
                type: Actions.updateComparisons,
                payload: { updated: data },
            });
        });
    };

    const onFailure = data => {
        notifications.success({
            title: translate('notifications.error.comparison_complete'),
            message: data.msg,
        });
    };

    const onComplete = data => {
        notifications.success({
            title: translate('notifications.success.comparison_complete'),
            message: data.msg,
        });
        api.getComparisons().then(data => {
            dispatch({
                type: Actions.updateComparisons,
                payload: { updated: data },
            });
        });
    };

    const onDeleted = data => {
        console.log(`delete ${data}`);
        dispatch({
            type: Actions.comparisonDeleted,
            payload: { data },
        });
    };

    useEffect(() => {
        const disconnect = useMqttMessages(mqtypes.exchanges.mqtt.topics.workflows.update, onMessage);

        websocket.on(websocketEventsEnum.STREAM_COMPARE.DELETED, onDeleted);
        websocket.on(websocketEventsEnum.STREAM_COMPARE.COMPLETE, onComplete);
        websocket.on(websocketEventsEnum.STREAM_COMPARE.FAILED, onFailure);

        api.getComparisons().then(data => {
            dispatch({
                type: Actions.updateComparisons,
                payload: { added: data, removedIds: [] },
            });
        });

        return () => {
            websocket.off(websocketEventsEnum.STREAM_COMPARE.DELETED, onDeleted);
            websocket.off(websocketEventsEnum.STREAM_COMPARE.COMPLETE, onComplete);
            websocket.off(websocketEventsEnum.STREAM_COMPARE.FAILED, onFailure);
            disconnect();
        };
    }, []);

    const onClickRow = comparisonID => {
        const route = routeBuilder.comparison_stream_page(comparisonID);
        window.appHistory.push(route);
    };

    const doDelete = idsToDelete => {
        dispatch({ type: Actions.requestDelete, data: { ids: [] } });

        if (idsToDelete.length === 0) return;

        dispatch({ type: Actions.clearSelection });

        idsToDelete.forEach(id => dispatch({ type: Actions.deleteComparison, data: { id } }));
    };

    const onToolBarRequestDelete = data => {
        // popup for confirm
        dispatch({ type: Actions.requestDelete, data: { ids: data } });
    };

    return (
        <div>
            <DeleteModal
                label="comparison.delete_header"
                message="comparison.delete_message"
                data={state.itemsToDelete}
                onDelete={doDelete}
            />
            <div>
                <Toolbar cbFunction={onToolBarRequestDelete} selectedItems={state.selected} />
                <ComparisonsTable
                    data={state.data}
                    selectedIds={state.selected}
                    selectAll={state.selectAll}
                    onSelectId={toggleRow}
                    onSelectAll={toggleSelectAll}
                    onClickRow={onClickRow}
                    getVisible={getVisible}
                />
            </div>
        </div>
    );
};

export default ComparisonsList;
