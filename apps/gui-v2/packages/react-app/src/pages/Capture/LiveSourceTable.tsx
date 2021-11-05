import React from 'react';
import { CustomScrollbar } from '../../components';
import AddSourceModal from './AddSourceModal';
import { EditIcon, PlusIcon, MinusIcon } from '../../components/icons/index';
import list from '../../utils/api';
import './styles.scss';

interface IComponentProps {
    liveSourceTableData: Array<IRowItem>;
    onRowClick: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    selectedLiveSourceIds: string[];
}

function LiveSourceTable({
    liveSourceTableData,
    onRowClick,
    selectedLiveSourceIds,
}: IComponentProps) {
    const sources =  [
        { "id": "33368c40-37f9-11ec-82a7-5970cb0925f1", "kind": "user_defined", "meta": { "label": "source 1" }, "sdp": { "streams": [ { "dstAddr": "225.5.5.1", "dstPort": 1000 } ] } },
        { "id": "33368c40-37f9-11ec-82a7-5970cb0925f2", "kind": "user_defined", "meta": { "label": "source 2" }, "sdp": { "streams": [ { "dstAddr": "225.5.5.2", "dstPort": 1000 } ] } }
    ]
    const [modalIsOpen, setIsOpen] = React.useState<boolean>(false);

    const onPressAdd = () => {
        //sources.map((s) => { list.live.addSource(s); })
        setIsOpen(true);
    };
    const onPressDelete = () => {
        console.log('DELETE')
        console.log(selectedLiveSourceIds)
        sources.map((s) => { list.live.deleteSource(s.id); })
    };

    return (
        <div className="capture-page-container">
            <AddSourceModal
                isOpen={modalIsOpen}
                onAdd={() => {console.log('onAdd')}}
                onClose={() => {console.log('onClose')}}
            />
            <div className="capture-container">
                <div className="capture-title">
                    <span>Live source</span>
                </div>
                <div className="capture-container">
                    <div className="live-source-table-tool-row">
                        <button className="live-source-button" onClick={onPressAdd}>
                            <PlusIcon />
                        </button>
                        <button className="live-source-button" onClick={onPressDelete}>
                            <MinusIcon />
                        </button>
                        <button className="live-source-button">
                            <EditIcon />
                        </button>
                    </div>
                    <table className="live-source-table">
                        <thead>
                            <tr className="live-source-table-header-table-row">
                                <th>Name</th>
                                <th>Mcast</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liveSourceTableData.map((item: any) => {
                                const isActive = selectedLiveSourceIds.includes(item.id);
                                return (
                                    <tr
                                        className={isActive ?
                                            'live-source-table-row active' : 'live-source-table-row'}
                                        key={item.id}
                                        onClick={(e: any) => onRowClick(item, e)}
                                    >
                                        <td className="live-source-name-data-container">
                                            <span className="live-source-table-label">
                                                {item.meta.label}
                                            </span>
                                        </td>
                                        <td className="live-source-name-data-container">
                                            <span className="live-source-table-label">
                                                {item.sdp.streams[0].dstAddr}:{item.sdp.streams[0].dstPort}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export interface IRowItem {
    label: string;
    mcast: string;
}

export default LiveSourceTable;
