import { CustomScrollbar } from '../../components';
import { getMediaTypeIcon, getComparisonType } from '../../utils/titles';
import list from '../../utils/api';
import './styles.scss';

function LiveSourceTable({
    liveSourceTableData,
    selectedLiveSourcesIds,
}: any) {
    const sources =  [
        { "id": "33368c40-37f9-11ec-82a7-5970cb0925f1", "kind": "user_defined", "meta": { "label": "source 1" }, "sdp": { "streams": [ { "dstAddr": "225.5.5.1", "dstPort": 1000 } ] } },
        { "id": "33368c40-37f9-11ec-82a7-5970cb0925f2", "kind": "user_defined", "meta": { "label": "source 2" }, "sdp": { "streams": [ { "dstAddr": "225.5.5.2", "dstPort": 1000 } ] } }
    ]
    const onPressAdd = () => { sources.map((s) => { list.live.addSource(s); }) };
    const onPressDelete = () => { sources.map((s) => { list.live.deleteSource(s.id); }) };

    return (
        <>
            <div className="main-page-dashboard">
                    <div className="capture-page-container">
                        <div className="capture-container">
                            <div className="capture-content-row">
                                <div className="capture-page-select">
                                    <button className="capture-page-capture-button" onClick={onPressAdd}> Add source </button>
                                </div>
                                <div className="capture-page-select">
                                    <button className="capture-page-capture-button" onClick={onPressDelete}> del Source </button>
                                </div>
                            </div>
                        </div>
                        <div className="live-stream-table-container">
                            <table className="live-stream-table">
                                <thead>
                                    <tr className="live-source-table-header-table-row">
                                        <th>Name</th>
                                        <th>Mcast</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {liveSourceTableData.map((item: any) => {
                                        const isActive = selectedLiveSourcesIds.includes(item.id);
                                        return (
                                            <tr
                                                className={isActive ?
                                                    'live-source-table-row active' : 'live-source-table-row'}
                                                key={item.id}
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
        </>
    );
}

export default LiveSourceTable;
