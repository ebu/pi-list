import React from 'react';
import './styles.scss';
import { StatusTag } from '../index';
import { translate } from '../../utils/translation';

interface IComponentProps {
    detailsTableData: Array<IRowItem>;
    selectedPcapIds: string[];
    onRowClicked: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    onDoubleClick: (id: string) => void;
    detailsPcapsAnalysingData?: IRowPcapAnalysingItem[];
}

function DetailsTable({
    detailsTableData,
    selectedPcapIds,
    onRowClicked,
    onDoubleClick,
    detailsPcapsAnalysingData,
}: IComponentProps) {
    const getKey = (key: number): string => (key + 1).toString().padStart(2, '0');

    return (
        <>
            <table className="details-table">
                <thead>
                    <tr className="details-table-header-table-row">
                        <th></th>
                        <th>Filename</th>
                        <th>Status</th>
                        <th className="details-table-centered-header-label">{translate('headings.video')}</th>
                        <th className="details-table-centered-header-label">{translate('headings.audio')}</th>
                        <th className="details-table-centered-header-label">Ancillary</th>
                        <th className="details-table-centered-header-label">{translate('headings.unknown')}</th>
                    </tr>
                </thead>
                <tbody>
                    {detailsPcapsAnalysingData?.map(item => {
                        return (
                            <tr className={'details-table-row'} key={item.id}>
                                <td>
                                    <span className="details-table-filename-index"></span>
                                </td>
                                <td className="details-table-filename-data">
                                    <span className="details-table-filename-name">{item.file_name}</span>
                                </td>
                                <td className="details-table-status-data">
                                    <span className="details-table-analysing-data">Analysing</span>
                                    <div className="details-table-progress-bar">
                                        <div className="progress" style={{ width: `${item.progress}%` }} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {detailsTableData.map(item => {
                        const status = {
                            compliant: item.compliant !== undefined ? item.compliant : false,
                        };
                        const handleRowClick = (e: React.MouseEvent<HTMLElement>) => {
                            onRowClicked(item.id, e);
                        };

                        const isActive = selectedPcapIds.includes(item.id);
                        return (
                            <tr
                                className={isActive ? 'details-table-row active' : 'details-table-row'}
                                onClick={handleRowClick}
                                onDoubleClick={() => (item.compliant !== undefined ? onDoubleClick(item.id) : null)}
                                key={item.id}
                            >
                                <td>
                                    <span className="details-table-filename-index">{getKey(item.index)}</span>
                                </td>
                                <td className="details-table-filename-data">
                                    <span className="details-table-filename-name">{item.filename}</span>
                                </td>
                                <td className="details-table-status-data">
                                    {item.compliant !== undefined ? (
                                        <StatusTag status={status} unknown={item.unknown} />
                                    ) : (
                                        'ERROR'
                                    )}
                                </td>
                                <td
                                    className={
                                        item.video === 0 ? 'details-table-video-data none' : 'details-table-video-data'
                                    }
                                >
                                    {item.video === 0 ? 'None' : item.video}
                                </td>
                                <td
                                    className={
                                        item.audio === 0 ? 'details-table-audio-data none' : 'details-table-audio-data'
                                    }
                                >
                                    {item.audio === 0 ? 'None' : item.audio}
                                </td>
                                <td
                                    className={
                                        item.ancillary === 0
                                            ? 'details-table-ancialary-data none'
                                            : 'details-table-ancialary-data'
                                    }
                                >
                                    {item.ancillary === 0 ? 'None' : item.ancillary}
                                </td>
                                <td
                                    className={
                                        item.unknown === 0
                                            ? 'details-table-unknown-data none'
                                            : 'details-table-unknown-data'
                                    }
                                >
                                    {item.unknown === 0 ? 'None' : item.unknown}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
}

export interface IRowItem {
    id: string;
    filename: string;
    index: number;
    compliant: boolean | undefined;
    video: number;
    audio: number;
    ancillary: number;
    unknown: number;
}

export interface IRowPcapAnalysingItem {
    id: string;
    file_name: string;
    pcap_file_name: string;
    data: number;
    progress: number;
}

export default DetailsTable;
