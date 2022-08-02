import { LineGraphic, IGraphicTimeValueData, MinMaxAvgLineGraphic } from 'components/index';
import SDK, { api } from '@bisect/ebu-list-sdk';
import { getLeftMargin, dataAsMicroseconds, getFinalData } from 'utils/graphs/dataTransformationLineGraphs';
import { useGraphData } from 'utils/graphs/getGraphData';
import { getFinalDataMinMaxAvgGraph } from 'utils/graphs/dataTransformationMinMaxAvgGraph';

function FtpAnalysis({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [ftpData, setFtpData] = useGraphData({
        pcapID,
        streamID,
        measurementType: api.constants.measurements.DELTA_TO_IDEAL_TPR0,
        first_packet_ts,
        last_packet_ts,
    });

    if (!ftpData) return null;

    if (ftpData.data.length === 0) {
        return null;
    }

    const ftpFinalData = ftpData.isGrouped
        ? getFinalDataMinMaxAvgGraph(ftpData.data)
        : getFinalData(dataAsMicroseconds(ftpData.data));

    const leftMargin = ftpData.isGrouped ? getLeftMargin(ftpData.data) : getLeftMargin(ftpFinalData!);

    const ftpLineGraphData = {
        graphicData: getFinalData(ftpFinalData!),
        title: 'TVD minus First Packet Time',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'FPT (μs)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMargin,
    };

    const ftpMinMaxAvgGraphData = {
        graphicData: getFinalDataMinMaxAvgGraph(ftpData.data!),
        title: 'TVD minus First Packet Time',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'FPT (μs)',
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMargin,
    };

    return (
        <>
            {!ftpData.isGrouped ? (
                <LineGraphic key={currentStream?.id} data={ftpLineGraphData} getNewData={setFtpData} />
            ) : (
                <MinMaxAvgLineGraphic key={currentStream?.id} data={ftpMinMaxAvgGraphData} getNewData={setFtpData} />
            )}
        </>
    );
}

export default FtpAnalysis;
