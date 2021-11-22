import React from 'react';
import { BarGraphic } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import {
    IHistogram,
    getFinalHistData,
    getLeftMarginBarGraphic,
    getPercHistData,
    getCompliance,
} from '../../../../utils/graphs/dataTransformationBarGraphs';
import { translate } from '../../../../utils/translation';

function PacketIntervalTimeGraph({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    const streamID = currentStream?.id;

    const initialHist: IHistogram = { histogram: [] };
    const [pitHistData, setPitHistData] = React.useState(initialHist);

    React.useEffect(() => {
        const loadPitHistData = async (): Promise<void> => {
            const all = await list.stream.getPitHistogramForStream(pcapID, streamID);
            setPitHistData(all);
        };
        loadPitHistData();
    }, [currentStream?.id]);

    const mediaInfoHistogram = 'Packet Interval Time Histogram';
    const generalBufferLevel = translate('general.buffer_level');

    if (pitHistData === undefined) {
        return null;
    }
    const pitHistPercData: number[][] = getPercHistData(pitHistData);
    const pitHistFinalData = getFinalHistData(pitHistPercData);
    const leftMarginPitHist = getLeftMarginBarGraphic(pitHistFinalData);
    const pitHistGraphData = {
        barGraphic: pitHistFinalData,
        title: mediaInfoHistogram,
        xAxisTitle: generalBufferLevel,
        yAxisTitle: '%',
        datakeyY: 'value',
        datakeyX: 'label',
        leftMargin: leftMarginPitHist,
    };

    return (
        <>
            <div className="pcap-details-page-bar-graphic-container ">
                <BarGraphic key={currentStream?.id} barGraphicData={pitHistGraphData} />
            </div>
        </>
    );
}

export default PacketIntervalTimeGraph;
