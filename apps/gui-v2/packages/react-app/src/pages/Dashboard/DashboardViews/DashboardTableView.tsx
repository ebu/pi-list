import React from 'react';
import { DetailsTableHOC } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import '../styles.scss';
import UploadPcap from '../UploadPcap/UploadPcap';
import { useRecoilValue } from 'recoil';
import { pcapsAnalysingAtom } from '../../../store/gui/pcaps/pcapsAnalysing';

interface IDetailsTableData {
    id: string;
    filename: string;
    index: number;
    compliant: boolean | undefined;
    video: number;
    audio: number;
    ttml: number;
    ancillary: number;
    unknown: number;
}

interface IPropTypes {
    pcaps: SDK.types.IPcapInfo[];
    onRowClicked: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    onDoubleClick: (id: string) => void;
    selectedPcapIds: string[];
}

const DashboardTableView: React.FunctionComponent<IPropTypes> = ({
    pcaps,
    onRowClicked,
    onDoubleClick,
    selectedPcapIds,
}: IPropTypes) => {
    const pcapsAnalysing = useRecoilValue(pcapsAnalysingAtom);

    const getTableData = (pcaps: SDK.types.IPcapInfo[]): IDetailsTableData[] => {
        const tableData: IDetailsTableData[] = [];
        pcaps.forEach((item, index) => {
            const data = {
                id: item.id,
                filename: item.file_name,
                index: index,
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
            <div className="dashboard-details-table-container">
                <div className="details-table-container">
                    <UploadPcap isButton={true} />
                    <DetailsTableHOC
                        onRowClicked={onRowClicked}
                        onDoubleClick={onDoubleClick}
                        detailsTableData={getTableData(pcaps)}
                        selectedPcapIds={selectedPcapIds}
                        detailsPcapsAnalysingData={pcapsAnalysing}
                    />
                </div>
            </div>
        </>
    );
};

export default DashboardTableView;
