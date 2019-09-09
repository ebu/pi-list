import React, { useState, useContext } from 'react';
import 'react-table/react-table.css';
import routeBuilder from '../../utils/routeBuilder';
import PcapTable from './PcapTable';
import PcapToolbar from './PcapToolbar';
import PopUp from '../../components/common/PopUp';
import DeleteModal from '../../components/DeleteModal';
import { StateContext } from './Context';
import Actions from './Actions';
import { T } from '../../utils/translation';
import api from '../../utils/api';

const NoData = () => (
    <div className="lst-text-center"><T t="pcap.no_pcaps" /></div>
);

const PcapList = (props) => {

    const [state, dispatch] = useContext(StateContext);
    let version = '';
    api.getVersion().then(ver => version = `${ver.major}.${ver.minor}.${ver.patch}`);

    const toggleRow = (id) => dispatch({ type: Actions.toggleRow, data: { id } });
    const toggleSelectAll = () => dispatch({ type: Actions.toggleSelectAll });

    const onClickRow = (pcapId) => {
        const pcapInfo = state.data.find(element => {
            return element.id === pcapId;
        });

        if (pcapInfo.analyzer_version !== version) {
            dispatch({ type: Actions.requestPcapReanalysis, data: { id: pcapId } });
        }
        else {
            const route = routeBuilder.pcap_stream_list(pcapId);
            window.appHistory.push(route);
        }
    };

    const doPcapReanalysis = (pcapId) => {
        if (pcapId)
            dispatch({ type: Actions.reanalyzePcap, data: { id: pcapId } });

        dispatch({ type: Actions.requestPcapReanalysis, data: { id: undefined } });
    };

    const doDelete = (idsToDelete) => {
        dispatch({ type: Actions.requestDelete, data: { ids: [] } });

        if (idsToDelete.length === 0) return;

        dispatch({ type: Actions.clearSelection });

        // TODO: refactor this to delete all with a single call
        idsToDelete.forEach(id => dispatch({ type: Actions.deletePcap, data: { id } }));
    };

    const withData = (
        <div>
            <PcapToolbar
                selectedItems={state.selected}
            />
            <PcapTable
                pcaps={state.data}
                selectedIds={state.selected}
                selectAll={state.selectAll}
                onSelectId={toggleRow}
                onSelectAll={toggleSelectAll}
                onClickRow={onClickRow}
            />
        </div>
    );

    const noData = <NoData />;

    return (
        <div>
            <PopUp
                type="delete"
                visible={state.itemToReanalyze != undefined}
                label="Information"
                message="Do you wish to reanalyze this capture?"
                onClose={() => doPcapReanalysis(undefined)}
                onDelete={() => doPcapReanalysis(state.itemToReanalyze)} />
            <DeleteModal
                label="pcap.delete_header"
                message="pcap.delete_message"
                data={state.itemsToDelete}
                onDelete={doDelete} />
            {state.data.length === 0 ? noData : withData}
        </div>
    );
};

export default PcapList;
