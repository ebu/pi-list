import React from 'react';
import { LineGraphic, IGraphicTimeValueData } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import { getLeftMargin } from '../../../../utils/graphs/dataTransformationLineGraphs';
import { translate } from '../../../../utils/translation';

interface IGraphicFinalData {
    data: IGraphicTimeValueData[];
    toleranceValue: number;
}
interface IGraphicInitialData {
    'high-tolerance': string;
    time: string;
    value: number;
}

const getFinalData = (data: IGraphicInitialData[]) => {
    const result: IGraphicFinalData = { data: [], toleranceValue: 0 };
    result.data = data.reduce((acc, curr) => {
        if ((curr.time !== undefined || null) && (curr.value !== null || undefined)) {
            const data = { time: curr.time, value: curr.value };
            acc.push(data);
        }
        return acc;
    }, [] as IGraphicTimeValueData[]);

    if (typeof data[0]['high-tolerance'] !== 'undefined') result.toleranceValue = parseInt(data[0]['high-tolerance']);

    return result;
};

function Tsdf({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;
    const tsdfTolerance = currentStream?.global_audio_analysis.tsdf.tolerance.toString();
    const tsdfMax = currentStream?.global_audio_analysis.tsdf.max.toString();

    const [tsdfData, setTsdfData] = React.useState<IGraphicInitialData[]>([]);

    React.useEffect(() => {
        const loadTsdfData = async (): Promise<void> => {
            const all = await list.stream.getAudioTimeStampedDelayFactor(
                pcapID,
                streamID,
                first_packet_ts,
                last_packet_ts,
                tsdfTolerance,
                tsdfMax
            );
            setTsdfData(all);
        };
        loadTsdfData();
    }, [currentStream?.id]);

    const mediaInfoTsdf = translate('media_information.tsdf');
    const mediaInfoTimelime = translate('media_information.timeline');

    if (tsdfData.length === 0) {
        return null;
    }

    const tsdfFinalData = getFinalData(tsdfData);

    const leftMargin = getLeftMargin(tsdfData);

    const tsdfGraphData = {
        graphicData: tsdfFinalData.data,
        toleranceValue: tsdfFinalData.toleranceValue,
        title: mediaInfoTsdf,
        xAxisTitle: mediaInfoTimelime,
        yAxisTitle: 'Value (μs)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMargin,
    };

    return (
        <>
            <LineGraphic key={currentStream?.id} data={tsdfGraphData} />
        </>
    );
}

export default Tsdf;
