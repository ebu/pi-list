import React from 'react';
import { CustomScrollbar } from '../../components';
import ConfirmModal from './ConfirmModal';
import AddSourceModal from './AddSourceModal';
import EditSourceModal from './EditSourceModal';
import { EditIcon, PlusIcon, MinusIcon } from 'components/icons/index';
import { SearchBar } from 'components/index';
import { findOne } from 'utils/searchBar';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { v1 as uuidv1 } from 'uuid';
import './styles.scss';

interface IComponentProps {
    liveSourceTableData: Array<SDK.types.ILiveSource>;
    onRowClick: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    selectedLiveSourceIds: string[];
}

function LiveSourceTable({
    liveSourceTableData,
    onRowClick,
    selectedLiveSourceIds,
}: IComponentProps) {
    const [addModalIsOpen, setAddModalIsOpen] = React.useState<boolean>(false);
    const [editModalIsOpen, setEditModalIsOpen] = React.useState<boolean>(false);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = React.useState<boolean>(false);
    const [filterString, setFilterString] = React.useState<string>('');
    const [filteredLiveSourceTableData, setFilteredLiveSourceTableData] = React.useState<any[]>(liveSourceTableData);

    React.useEffect(() => {
        if (filterString === '') {
            setFilteredLiveSourceTableData(liveSourceTableData);
        } else {
            const tokens = filterString.split(/\s+/).filter(v => v !== '');
            const dataFilter = liveSourceTableData.filter(value => {
                const nameResult = findOne(value.meta.label, tokens);
                const addressResult = findOne(value.sdp.streams[0].dstAddr, tokens);
                const selectedResult = selectedLiveSourceIds.includes(value.id);
                return nameResult || addressResult || selectedResult;
            });
            setFilteredLiveSourceTableData(dataFilter);
        }
    }, [filterString, selectedLiveSourceIds, liveSourceTableData]);

    const onPressAdd = () => {
        setAddModalIsOpen(true);
    };

    const onPressEdit = () => {
        console.log('EditSource')
        if (selectedLiveSourceIds.length > 0) {
            setEditModalIsOpen(true);
        }
    };

    const onPressDelete = () => {
        if (selectedLiveSourceIds.length > 0) {
            setDeleteModalIsOpen(true);
        }
    };

    const onAdd = (s: {label: string, multicast: string, port: string}) => {
        const source = {
            "id": uuidv1(),
            "kind": "user_defined",
            "meta": {
                "label": s.label
            },
            "sdp": {
                "streams": [ {
                    "dstAddr": s.multicast,
                    "dstPort": parseInt(s.port)
                } ]
            }
        };
        list.live.addSource(source);
    };

    const onEdit = (s: {id: string, label: string, multicast: string, port: string}) => {
        let cloned: SDK.types.ILiveSource = Object.assign(
            {}, liveSourceTableData.filter(e => e.id === s.id)[0]
        );
        cloned = Object.assign(cloned, {
            "meta": {
                "label": s.label,
            },
            "sdp": {
                "streams": [ {
                    "dstAddr": s.multicast,
                    "dstPort": parseInt(s.port)
                } ]
            }
        });

        list.live.updateSource(cloned);
    }

    const onDelete = () => {
        selectedLiveSourceIds.map((s) => { list.live.deleteSource(s); })
    }

    return (
        <div>
            <AddSourceModal
                isOpen={addModalIsOpen}
                onAdd={onAdd}
            />
            <ConfirmModal
                message={`delete ${JSON.stringify(selectedLiveSourceIds)}`}
                isOpen={deleteModalIsOpen}
                onConfirm={onDelete}
            />
            { editModalIsOpen? // wait for non-empty selection
                <EditSourceModal
                    source={liveSourceTableData.filter(e => e.id === selectedLiveSourceIds[0])[0]}
                    isOpen={editModalIsOpen}
                    onEdit={onEdit}
                /> : <></>
            }
        <div className="capture-page-container">
            <div className="capture-container">
                <div className="capture-title">
                    <span>Live sources</span>
                </div>
                <div className="capture-container">
                    <div className="live-source-table-tool-row">
                        <button className="live-source-button" onClick={onPressAdd}>
                            <PlusIcon />
                        </button>
                        <button className="live-source-button" onClick={onPressDelete}>
                            <MinusIcon />
                        </button>
                        <button className="live-source-button" onClick={onPressEdit}>
                            <EditIcon />
                        </button>
                        <SearchBar filterString={filterString} setFilterString={setFilterString} />
                    </div>
                    <table className="live-source-table">
                        <thead>
                            <tr className="live-source-table-header-table-row">
                                <th>Name</th>
                                <th>Mcast</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLiveSourceTableData.map((item: any) => {
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
        </div>
    );
}

export default LiveSourceTable;
