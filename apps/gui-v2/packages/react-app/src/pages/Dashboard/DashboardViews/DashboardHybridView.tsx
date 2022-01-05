import React from 'react';
import { pcapsAnalysingAtom } from '../../../store/gui/pcaps/pcapsAnalysing';
import UploadPcap from '../UploadPcap/UploadPcap';
import { DetailsTableHOC, SearchBar } from 'components/index';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { pcapAnalysingToTile, pcapToTile } from 'pages/Common/DashboardTileHOC';
import { findOne } from '../../../utils/searchBar';
import SDK from '@bisect/ebu-list-sdk';
import _ from 'lodash';
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
    onDoubleClick: (id: string, analyzerVersion: string) => void;
    selectedPcapIds: string[];
}
const DashboardHybridView: React.FunctionComponent<IPropTypes> = ({
    onClick,
    pcaps,
    onRowClicked,
    onDoubleClick,
    selectedPcapIds,
}: IPropTypes) => {
    const pcapsAnalysing = useRecoilValue(pcapsAnalysingAtom);
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
                srt: item.srt_streams,
                unknown:
                    item.total_streams -
                    (item.video_streams + item.audio_streams + item.anc_streams + item.ttml_streams + item.srt_streams),
                analyzerVersion: item.analyzer_version,
            };
            tableData.push(data);
        });
        return tableData;
    };

    const [filterString, setFilterString] = React.useState<string>('');
    const [filterTableData, setFilterTableData] = React.useState<any[]>(getTableData(pcaps));
    const [filterTilesData, setFilterTilesData] = React.useState<any[]>(pcaps.slice(0, 3));

    React.useEffect(() => {
        if (filterString === '') {
            setFilterTableData(getTableData(pcaps));
            setFilterTilesData(pcaps.slice(0, 3));
        } else {
            const tokens = filterString.split(/\s+/).filter(v => v !== '');

            const dataFilter = pcaps.filter(value => {
                const filenameResult = findOne(value.file_name, tokens);
                const unknownStreams =
                    value.total_streams -
                    (value.video_streams + value.audio_streams + value.anc_streams + value.ttml_streams);
                const compliant =
                    value.summary === undefined ? undefined : value.summary.error_list.length === 0 ? true : false;
                const compliantResult =
                    unknownStreams > 0
                        ? findOne('unknown', tokens)
                        : compliant === true
                        ? findOne('compliant', tokens)
                        : findOne('not', tokens) || findOne('compliant', tokens);

                return filenameResult || compliantResult;
            });
            setFilterTableData(getTableData(dataFilter));
            setFilterTilesData(dataFilter.slice(0, 3));
        }

        if (pcapsAnalysing.length > 0) {
            const numberPcapsToShow = 3 - pcapsAnalysing.length;
            numberPcapsToShow > 0 ? setFilterTilesData(pcaps.slice(0, numberPcapsToShow)) : setFilterTilesData([]);
        }
    }, [filterString, pcapsAnalysing, pcaps]);

    return (
        <>
            <div className="dashboard-search-bar-container">
                <SearchBar filterString={filterString} setFilterString={setFilterString} />
            </div>
            <div className="dashboard-page-container">
                <div className="dashboard-page-container-drag-and-drop-tile">
                    <UploadPcap isButton={false} />
                </div>
                {pcapsAnalysing.map((pcap: SDK.types.IPcapFileReceived, index: number) => pcapAnalysingToTile(pcap))}
                {filterTilesData.map((pcap: SDK.types.IPcapInfo, index: number) =>
                    pcapToTile(onDoubleClick, onClick, pcap, index, selectedPcapIds)
                )}
            </div>
            <div className="dashboard-details-table-container">
                <div className="details-table-container">
                    {filterTableData.length === 0 ? null : (
                        <DetailsTableHOC
                            onRowClicked={onRowClicked}
                            onDoubleClick={onDoubleClick}
                            detailsTableData={filterTableData}
                            selectedPcapIds={selectedPcapIds}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default DashboardHybridView;
