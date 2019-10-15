import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import Toolbar from './Toolbar';
import SourcesTable from './SourcesTable';
import Actions from './Actions';
import { reducer } from './reducer';
import { middleware } from './middleware';
import {
    tableInitialState,
    makeTableReducer,
} from '../../../utils/models/table/tableReducer';
import tableactions from '../../../utils/models/table/actions';
import DeleteModal from '../../../components/DeleteModal';
import { useMqttMessages } from '../../../utils/mqtt';
import mqtypes from 'ebu_list_common/mq/types';
import api from '../../../utils/api';
import DragAndDropUploader from '../../../components/upload/DragAndDropUploader';
import { translateX } from '../../../utils/translation';
import AddSourceModal from './AddSourceModal';
import EditSourceModal from './EditSourceModal';
import './SourcesList.scss';
import { kinds } from 'ebu_list_common/capture/sources';

const filterFunction = (state) => {
    return state.data;
};

const reducerOptions = {
    filterFunction: filterFunction
};

const tableReducer = makeTableReducer(reducerOptions);

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(tableReducer(state, action), action);
};
const initialState = {
    ...tableInitialState(),
    addSourceModalVisible: false,
    editSourceModalVisible: false,
};

const filterData = (data, filterString) => {
    if (!filterString) {
        return data;
    }

    const tokens = filterString.split(' ').filter(v => v !== '');
    console.dir(tokens);

    const match = (label) => {
        return !tokens.some(token => {
            const regSearch = new RegExp('.*' + token + '.*', 'i');
            return !label.match(regSearch);
        });
    };

    const filterPredicate = v => {
        const label = _.get(v, ['meta', 'label'], undefined);
        if (label === undefined) {
            return false;
        }

        return match(label);
    };

    return data.filter(filterPredicate);
};

const SourcesList = props => {
    const [state, dispatch] = useReducer(actionsWorkflow, initialState);
    const [sourcesToEdit, setSourcesToEdit] = useState([]);

    const toggleRow = id =>
        dispatch({ type: tableactions.toggleRow, data: { id } });
    const toggleSelectAll = () =>
        dispatch({ type: tableactions.toggleSelectAll });

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

    const onAddSourceModalClose = () =>
        dispatch({ type: Actions.hideAddSource });
    const onModalAddSources = sources =>
        dispatch({ type: Actions.addSources, payload: { sources } });

    const onEditSourceModalClose = () =>
        dispatch({ type: Actions.hideEditSource });

    const filteredData = filterData(state.data, state.filterString);

    useEffect(() => { 
        const selectedSources = state.data.filter(source => state.selected.includes(source.id));
        props.onSelectedSendersChanged({selectedSources: selectedSources});


        setSourcesToEdit(
            selectedSources
            .filter(s => s.kind === kinds.user_defined)
            .map(
                obj => {
                    return {
                        id: obj.id,
                        description : obj.meta.label,
                        dstAddr : obj.meta.network.destination.split(":")[0],
                        dstPort : obj.meta.network.destination.split(":")[1]
                    }
                }
            )
        );
        console.log(sourcesToEdit);

    }, [state.selected]);

    return (
        <div className="lst-sources-list">
            <DeleteModal
                label="live.sources.delete_header"
                message="live.sources.delete_message"
                data={state.itemsToDelete}
                onDelete={doDelete}
            />
            <AddSourceModal
                visible={state.addSourceModalVisible}
                onAdd={onModalAddSources}
                onClose={onAddSourceModalClose}
            />
            <EditSourceModal
                sources={sourcesToEdit}
                visible={state.editSourceModalVisible}
                onEdit={onModalAddSources}
                onClose={onEditSourceModalClose}
            />
            <DragAndDropUploader
                uploadButtonLabel="SDP"
                uploadApi={onUpload}
                title={translateX('navigation.live_sources')}
            >
                <Toolbar
                    dispatch={dispatch}
                    selectedItems={state.selected}
                    filterString={state.filterString}
                />
                <SourcesTable
                    data={filteredData}
                    selectedIds={state.selected}
                    selectAll={state.selectAll}
                    onSelectId={toggleRow}
                    onSelectAll={toggleSelectAll}
                    onClickRow={toggleRow}
                />
            </DragAndDropUploader>
        </div>
    );
};

SourcesList.propTypes = {
    onSelectedSendersChanged: PropTypes.func
};

SourcesList.defaultProps = {
    onSelectedSendersChanged: () => {}
};

export default SourcesList;
