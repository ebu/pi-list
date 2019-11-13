import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import mqtypes from 'ebu_list_common/mq/types';
import { kinds } from 'ebu_list_common/capture/sources';
import Toolbar from './Toolbar';
import SourcesTable from './SourcesTable';
import Actions from './Actions';
import { reducer } from './reducer';
import { middleware } from './middleware';
import { tableInitialState, makeTableReducer } from '../../../utils/models/table/tableReducer';
import tableactions from '../../../utils/models/table/actions';
import DeleteModal from '../../../components/DeleteModal';
import { useMqttMessages } from '../../../utils/mqtt';
import api from '../../../utils/api';
import DragAndDropUploader from '../../../components/upload/DragAndDropUploader';
import { translateX } from '../../../utils/translation';
import AddSourceModal from './AddSourceModal';
import EditSourceModal from './EditSourceModal';
import './SourcesList.scss';
import PopUp from '../../../components/common/PopUp';

const filterFunction = state => {
    return state.data;
};

const reducerOptions = {
    filterFunction,
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

const findOne = (target, tokens) => {
    if (_.isNil(target)) return false;
    return tokens.some(token => {
        const regSearch = new RegExp(`.*${token}.*`, 'i');
        return target.match(regSearch);
    });
};

const filterData = (data, searchString) => {
    if (!searchString) return data;

    const tokens = searchString.split(/\s+/).filter(v => v !== '');

    const termsFilter = mediaSource => {
        const term = `${JSON.stringify(mediaSource.meta)} ${JSON.stringify(mediaSource.media_specific)}`;
        return findOne(term, tokens);
    };

    return data.filter(termsFilter);
};

const SourcesList = props => {
    const [state, dispatch] = useReducer(actionsWorkflow, initialState);
    const [sourcesToEdit, setSourcesToEdit] = useState([]);
    const [showSDPErrorPopUp, setShowSDPErrorPopUp] = useState({});

    const toggleRow = id => dispatch({ type: tableactions.toggleRow, data: { id } });
    const toggleSelectAll = () => dispatch({ type: tableactions.toggleSelectAll });

    const onClickRow = id => {
        dispatch({ type: tableactions.showSDPErrorPopUp, data: { id } });

        // keep same functionallity. select the row.
        toggleRow(id);
    };

    const onMessage = (topic, message) => {
        dispatch({
            type: Actions.updateSources,
            payload: message,
        });
    };

    useEffect(() => {
        const disconnect = useMqttMessages(mqtypes.exchanges.mqtt.topics.nmos.sender_list_update, onMessage);

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
            await api.addLiveSource(source);
        } catch (err) {
            // TODO: show this to user
            console.error('error adding source from SDP', err);
        }
    };

    const onAddSourceModalClose = () => dispatch({ type: Actions.hideAddSource });
    const onModalAddSources = sources => dispatch({ type: Actions.addSources, payload: { sources } });

    const onEditSourceModalClose = () => dispatch({ type: Actions.hideEditSource });

    const onShowSDPErrorPopUpClose = () => {
        dispatch({ type: tableactions.hideSDPErrorPopUp });
    };

    const filteredData = filterData(state.data, state.filterString);

    useEffect(() => {
        const selectedSources = state.data.filter(source => state.selected.includes(source.id));
        props.onSelectedSendersChanged({ selectedSources });

        setSourcesToEdit(
            selectedSources
                .filter(s => s.kind === kinds.user_defined)
                .map(obj => {
                    return {
                        id: obj.id,
                        description: obj.meta.label,
                        dstAddr: obj.meta.network.destination.split(':')[0],
                        dstPort: obj.meta.network.destination.split(':')[1],
                    };
                })
        );
    }, [state.selected]);

    useEffect(() => {
        setShowSDPErrorPopUp(state.showSDPErrorPopUp);
    }, [state.showSDPErrorPopUp]);

    return (
        <div className="lst-sources-list">
            <PopUp
                type="warning"
                visible={showSDPErrorPopUp.show}
                label="SDP Errors"
                message={showSDPErrorPopUp.error}
                onClose={onShowSDPErrorPopUpClose}
            />
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
                <Toolbar dispatch={dispatch} selectedItems={state.selected} filterString={state.filterString} />
                <SourcesTable
                    data={filteredData}
                    selectedIds={state.selected}
                    selectAll={state.selectAll}
                    onSelectId={toggleRow}
                    onSelectAll={toggleSelectAll}
                    onClickRow={onClickRow}
                />
            </DragAndDropUploader>
        </div>
    );
};

SourcesList.propTypes = {
    onSelectedSendersChanged: PropTypes.func,
};

SourcesList.defaultProps = {
    onSelectedSendersChanged: () => {},
};

export default SourcesList;
