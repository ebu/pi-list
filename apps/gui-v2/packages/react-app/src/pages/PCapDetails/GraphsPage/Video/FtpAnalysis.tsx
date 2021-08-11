import React from 'react';
import { LineGraphic, IGraphicTimeValueData } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import { getLeftMargin, dataAsMicroseconds, getFinalData } from '../../../../utils/graphs/dataTransformationLineGraphs';

function FtpAnalysis({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [ftpData, setFtpData] = React.useState<IGraphicTimeValueData[]>([]);
    React.useEffect(() => {
        const loadFtpData = async (): Promise<void> => {
            const all = await list.stream.getDeltaToIdealTpr0Raw(pcapID, streamID, first_packet_ts, last_packet_ts);
            const ftpFinalData = getFinalData(dataAsMicroseconds(all));
            setFtpData(ftpFinalData as IGraphicTimeValueData[]);
        };
        loadFtpData();
    }, [currentStream?.id]);

    if (ftpData.length === 0) {
        return null;
    }

    const leftMargin = getLeftMargin(ftpData);

    const ftpGraphData = {
        graphicData: ftpData,
        title: 'First Packet Time',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'FPT (μs)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMargin,
    };

    return (
        <>
            <LineGraphic key={currentStream?.id} data={ftpGraphData} />
        </>
    );
}

export default FtpAnalysis;
