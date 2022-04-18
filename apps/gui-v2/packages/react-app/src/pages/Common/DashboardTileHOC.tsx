import { DashboardTile } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';

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

const getInformation = (pcap: SDK.types.IPcapInfo): IInformation[] => {
    const values: Array<[string, number]> = [];

    const ancStreams = pcap.anc_streams;
    const audioStreams = pcap.audio_streams;
    const videoStreams = pcap.video_streams;
    const ttmlStreams = pcap.ttml_streams;
    const srtStreams = pcap.srt_streams;
    const totalStreams = pcap.total_streams;
    const unkownStreams = totalStreams - (videoStreams + audioStreams + ancStreams + ttmlStreams + srtStreams);

    values.push(['Ancillary', ancStreams]);
    values.push(['TTML', ttmlStreams]);
    values.push(['Audio', audioStreams]);
    values.push(['Video', videoStreams]);
    values.push(['SRT', srtStreams]);
    values.push(['Unknown', unkownStreams]);

    const activeValues = values.filter(v => v[1] > 0);

    return activeValues.map(([title, count]) => ({ number: count.toString(), title: title }));
};

const getContent = (pcap: SDK.types.IPcapInfo): { label: string; percentage: number } => {
    const ancStreams = pcap.anc_streams;
    const audioStreams = pcap.audio_streams;
    const videoStreams = pcap.video_streams;
    const ttmlStreams = pcap.ttml_streams;
    const srtStreams = pcap.srt_streams;
    const totalStreams = pcap.total_streams;
    const unkownStreams = totalStreams - (videoStreams + audioStreams + ancStreams + ttmlStreams + srtStreams);
    let label =
        pcap.summary === undefined ? 'ERROR' : pcap.summary.error_list.length === 0 ? 'Compliant' : 'Not Compliant';
    if(pcap.total_streams === 0){
        label = "Empty"
    }

    if (unkownStreams > 0) {
        label = 'Unknown';
    }
    return {
        label: label,
        percentage: 100,
    };
};

const getTitle = (pcap: SDK.types.IPcapInfo, index: number): { mainTitle: string; titleNumber: string } => ({
    mainTitle: pcap.file_name,
    titleNumber: (index + 1).toString().padStart(2, '0'),
});

const getTileInformation = (pcap: SDK.types.IPcapInfo, index: number): ITileInformation => ({
    information: getInformation(pcap),
    content: getContent(pcap),
    title: getTitle(pcap, index),
    id: pcap.id,
});

export const pcapCapturingToTile = (file_name: string, progress: number) => {
    const content = { label: 'Capturing', percentage: progress };
    const title = { mainTitle: file_name };
    return (
        <div className="dashboard-page-tile" key="0">
            <DashboardTile id={'0'} title={title} content={content} />
        </div>
    );
};

export const pcapAnalysingToTile = (pcap: SDK.types.IPcapFileReceived) => {
    const content = { label: 'Analysing', percentage: pcap.progress };
    const title = { mainTitle: pcap.file_name };
    return (
        <div className="dashboard-page-tile" key={pcap.id}>
            <DashboardTile id={pcap.id} title={title} content={content} />
        </div>
    );
};

export const pcapToTile = (
    onDoubleClick: (id: string, analyzerVersion: string) => void,
    onClick: (id: string, e: React.MouseEvent<HTMLElement>) => void,
    pcap: SDK.types.IPcapInfo,
    index: number,
    selectedPcapIds: string[]
) => {
    const tileInformation = getTileInformation(pcap, index);

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        onClick(tileInformation.id, e);
    };

    return (
        <div
            className="dashboard-page-tile"
            onClick={handleClick}
            onDoubleClick={() => {
                if(pcap.total_streams === 0) return;
                return tileInformation.content.label !== 'ERROR'
                ? onDoubleClick(tileInformation.id, pcap.analyzer_version)
                : null
            }
                
            }
            key={pcap.id}
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
