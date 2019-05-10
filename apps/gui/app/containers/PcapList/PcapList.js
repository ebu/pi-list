import React, { useState, useContext } from 'react';
import 'react-table/react-table.css';
import api from '../../utils/api';
import routeBuilder from '../../utils/routeBuilder';
import PcapTable from '../../components/pcap/PcapTable';
import PcapToolbar from './PcapToolbar';
import { downloadFiles } from '../../utils/download';
import DeleteModal from './DeleteModal';
import { StateContext } from './Context';
import Actions from './Actions';
import { T } from '../../utils/translation';

const NoData = () => (
    <div className="lst-text-center"><T t="pcap.no_pcaps" /></div>
);

const PcapList = (props) => {

    const [state, dispatch] = useContext(StateContext);

    const toggleRow = (id) => dispatch({ type: Actions.toggleRow, data: { id } });
    const toggleSelectAll = () => dispatch({ type: Actions.toggleSelectAll });

    const onPcapClick = (pcapId) => {
        const route = routeBuilder.pcap_stream_list(pcapId);
        window.appHistory.push(route);
    };

    const deletePcaps = (idsToDelete) => {
        dispatch({ type: Actions.requestDelete, data: { ids: [] } });

        if(idsToDelete.length === 0) return;

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
                onClickRow={onPcapClick}
            />
        </div>
    );

    const noData = <NoData />;

    return (
        <div>
            <DeleteModal data={state.itemsToDelete} onAction={deletePcaps} />
            {state.data.length === 0 ? noData : withData}
        </div>
    );
};

export default PcapList;
