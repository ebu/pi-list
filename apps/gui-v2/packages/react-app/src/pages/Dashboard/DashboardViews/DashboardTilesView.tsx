import { DashboardTile, DragAndDropTile } from 'components/index';
import UploadPcap from '../UploadPcap/UploadPcap';
import React, { MouseEventHandler } from 'react';
import SDK from '@bisect/ebu-list-sdk';
import '../styles.scss';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sidebarCollapsedAtom } from '../../../store/gui/sidebar/sidebarCollapsed';
import { pcapsAnalysingAtom } from '../../../store/gui/pcaps/pcapsAnalysing';

interface IInformation {
    number: string;
    title: string;
}

interface ITileInformation {
    id: string;
    information: IInformation[];
    title: { mainTitle: string; titleNumber: string };
    content: { label: string; percentage: number };
}

const getInformation = (pCap: SDK.types.IPcapInfo): IInformation[] => {
    const values: Array<[string, number]> = [];

    const ancStreams = pCap.anc_streams;
    const audioStreams = pCap.audio_streams;
    const videoStreams = pCap.video_streams;
    const totalStreams = pCap.total_streams;
    const unkownStreams = totalStreams - (videoStreams + audioStreams + ancStreams);

    values.push(['Ancillary', ancStreams]);
    values.push(['Audio', audioStreams]);
    values.push(['Video', videoStreams]);
    values.push(['Unknown', unkownStreams]);

    const activeValues = values.filter(v => v[1] > 0);

    return activeValues.map(([title, count]) => ({ number: count.toString(), title: title }));
};

const getContent = (pCap: SDK.types.IPcapInfo): { label: string; percentage: number } => ({
    label: pCap.summary === undefined ? 'ERROR' : pCap.summary.error_list.length === 0 ? 'Compliant' : 'Not Compliant',
    percentage: 100,
});

const getTitle = (pCap: SDK.types.IPcapInfo, index: number): { mainTitle: string; titleNumber: string } => ({
    mainTitle: pCap.file_name,
    titleNumber: (index + 1).toString().padStart(2, '0'),
});

const getTileInformation = (pCap: SDK.types.IPcapInfo, index: number): ITileInformation => ({
    information: getInformation(pCap),
    content: getContent(pCap),
    title: getTitle(pCap, index),
    id: pCap.id,
});

const pcapAnalysingToTile = (pcap: SDK.types.IPcapFileReceived) => {
    const content = { label: 'Analysing', percentage: pcap.progress };
    const title = { mainTitle: pcap.file_name };
    return (
        <div className="dashboard-page-tile" key={pcap.id}>
            <DashboardTile id={pcap.id} title={title} content={content} />
        </div>
    );
};

const pcapToTile = (
    onDoubleClick: (id: string) => void,
    onClick: (id: string, e: React.MouseEvent<HTMLElement>) => void,
    pCap: SDK.types.IPcapInfo,
    index: number,
    selectedPcapIds: string[]
) => {
    const tileInformation = getTileInformation(pCap, index);

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        onClick(tileInformation.id, e);
    };

    return (
        <div
            className="dashboard-page-tile"
            onClick={handleClick}
            onDoubleClick={() => (tileInformation.content.label !== 'ERROR' ? onDoubleClick(tileInformation.id) : null)}
            key={pCap.id}
        >
            <DashboardTile
                id={tileInformation.id}
                information={tileInformation.information}
                title={tileInformation.title}
                content={tileInformation.content}
                selectedPcapIds={selectedPcapIds}
            />
        </div>
    );
};

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
            {pcaps.map((pCap: SDK.types.IPcapInfo, index: number) =>
                pcapToTile(onDoubleClick, onClick, pCap, index, selectedPcapIds)
            )}
        </div>
    );
};

export default DashboardTilesView;
