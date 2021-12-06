import React from 'react';
import DashboardTilesView from './DashboardTilesView';
import { DetailsTableHOC } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import '../styles.scss';

interface IDetailsTableData {
    id: string;
    filename: string;
    index: number;
    compliant: boolean | undefined;
    video: number;
    ttml: number;
    audio: number;
    ancillary: number;
    unknown: number;
}

interface IPropTypes {
    onClick: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    pcaps: SDK.types.IPcapInfo[];
    onRowClicked: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    onDoubleClick: (id: string) => void;
    selectedPcapIds: string[];
}
const DashboardHybridView: React.FunctionComponent<IPropTypes> = ({
    onClick,
    pcaps,
    onRowClicked,
    onDoubleClick,
    selectedPcapIds,
}: IPropTypes) => {
    const getTableData = (pcaps: SDK.types.IPcapInfo[]): IDetailsTableData[] => {
        const tableData: IDetailsTableData[] = [];
        pcaps.slice(3).forEach((item, index) => {
            const data = {
                id: item.id,
                filename: item.file_name,
                index: index + 3,
                compliant: item.summary === undefined ? undefined : item.summary.error_list.length === 0 ? true : false,
                video: item.video_streams,
                ttml: item.ttml_streams,
                audio: item.audio_streams,
                ancillary: item.anc_streams,
                unknown:
                    item.total_streams -
                    (item.video_streams + item.audio_streams + item.anc_streams + item.ttml_streams),
            };
            tableData.push(data);
        });
        return tableData;
    };

    return (
        <>
            <DashboardTilesView
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                pcaps={pcaps.slice(0, 3)}
                selectedPcapIds={selectedPcapIds}
            />
            <div className="dashboard-details-table-container">
                <div className="details-table-container">
                    {getTableData(pcaps).length === 0 ? null : (
                        <DetailsTableHOC
                            onRowClicked={onRowClicked}
                            onDoubleClick={onDoubleClick}
                            detailsTableData={getTableData(pcaps)}
                            selectedPcapIds={selectedPcapIds}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default DashboardHybridView;
