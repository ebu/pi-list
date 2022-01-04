import UploadPcap from '../UploadPcap/UploadPcap';
import React, { MouseEventHandler } from 'react';
import { SearchBar } from 'components/index';
import { findOne } from '../../../utils/searchBar';
import SDK from '@bisect/ebu-list-sdk';
import '../styles.scss';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sidebarCollapsedAtom } from '../../../store/gui/sidebar/sidebarCollapsed';
import { pcapsAnalysingAtom } from '../../../store/gui/pcaps/pcapsAnalysing';
import { pcapAnalysingToTile, pcapToTile } from 'pages/Common/DashboardTileHOC';

interface IPropTypes {
    onClick: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    onDoubleClick: (id: string) => void;
    pcaps: SDK.types.IPcapInfo[];
    selectedPcapIds: string[];
}

const DashboardTilesView: React.FunctionComponent<IPropTypes> = ({
    onClick,
    onDoubleClick,
    pcaps,
    selectedPcapIds,
}: IPropTypes) => {
    const setSidebarCollapsed = useSetRecoilState(sidebarCollapsedAtom);
    React.useEffect(() => {
        setSidebarCollapsed(false);
    }, []);
    const pcapsAnalysing = useRecoilValue(pcapsAnalysingAtom);

    const [filterString, setFilterString] = React.useState<string>('');
    const [filterTilesData, setFilterTilesData] = React.useState<any[]>(pcaps);

    React.useEffect(() => {
        if (filterString === '') {
            setFilterTilesData(pcaps);
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
            setFilterTilesData(dataFilter);
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
        </>
    );
};

export default DashboardTilesView;
