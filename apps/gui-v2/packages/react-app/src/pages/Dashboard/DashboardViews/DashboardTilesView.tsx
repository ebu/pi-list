import UploadPcap from '../UploadPcap/UploadPcap';
import React, { MouseEventHandler } from 'react';
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
    return (
        <div className="dashboard-page-container">
            <div className="dashboard-page-container-drag-and-drop-tile">
                <UploadPcap isButton={false} />
            </div>
            {pcapsAnalysing.map((pcap: SDK.types.IPcapFileReceived, index: number) => pcapAnalysingToTile(pcap))}
            {pcaps.map((pcap: SDK.types.IPcapInfo, index: number) =>
                pcapToTile(onDoubleClick, onClick, pcap, index, selectedPcapIds)
            )}
        </div>
    );
};

export default DashboardTilesView;
