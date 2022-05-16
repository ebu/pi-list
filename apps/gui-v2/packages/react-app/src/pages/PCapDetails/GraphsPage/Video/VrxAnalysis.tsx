import React from 'react';
import { LineGraphic, IGraphicTimeMaxData, BarGraphic, MinMaxAvgLineGraphic } from 'components/index';
import SDK, { api } from '@bisect/ebu-list-sdk';
import list from 'utils/api';
import { getFinalData as getFinalDataLineGraphs, getLeftMargin } from 'utils/graphs/dataTransformationLineGraphs';
import { getFinalDataMinMaxAvgGraph } from 'utils/graphs/dataTransformationMinMaxAvgGraph';

import {
    IHistogram,
    getFinalHistData,
    getLeftMarginBarGraphic,
    getPercHistData,
    getCompliance,
} from 'utils/graphs/dataTransformationBarGraphs';
import { translate } from 'utils/translation';
import { useGraphData } from 'utils/graphs/getGraphData';

function VrxAnalysis({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [vrxData, setVrxData] = useGraphData({
        pcapID,
        streamID,
        measurementType: api.constants.measurements.VRX_IDEAL,
        first_packet_ts,
        last_packet_ts,
    });

    const initialHist: IHistogram = { histogram: [] };
    const [vrxHistData, setVrxHistData] = React.useState(initialHist);

    React.useEffect(() => {
        setVrxHistData(initialHist);
        const loadVrxHistData = async (): Promise<void> => {
            const all = await list.stream.getVrxHistogramForStream(pcapID, streamID);
            setVrxHistData(all);
        };
        loadVrxHistData();
    }, [currentStream?.id]);

    const mediaInfoHistogram = translate('media_information.histogram');
    const generalBufferLevel = translate('general.buffer_level');
    const mediaInfoRtpPacketCount = translate('media_information.rtp.packet_count');

    if (!vrxData) return null;

    if (vrxData.data.length === 0) {
        return null;
    }
    if (vrxHistData === undefined) {
        return null;
    }

    const vrxIdealFinalData = vrxData.isGrouped
        ? getFinalDataMinMaxAvgGraph(vrxData.data)
        : getFinalDataLineGraphs(vrxData.data);

    const leftMarginVrx = vrxData.isGrouped ? getLeftMargin(vrxData.data) : getLeftMargin(vrxIdealFinalData!);

    const vrxLineGraphData = {
        graphicData: getFinalDataLineGraphs(vrxData.data),
        title: 'Vrx',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: mediaInfoRtpPacketCount,
        datakeyY: 'max',
        datakeyX: 'time',
        leftMargin: leftMarginVrx,
    };

    const vrxMinMaxAvgGraphData = {
        graphicData: getFinalDataMinMaxAvgGraph(vrxData.data),
        title: 'Vrx',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: mediaInfoRtpPacketCount,
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMarginVrx,
    };

    const vrxHistPercData: number[][] = getPercHistData(vrxHistData);
    const vrxHistFinalData = getFinalHistData(vrxHistPercData);
    const leftMarginVrxHist = getLeftMarginBarGraphic(vrxHistFinalData);
    const complianceVrxHist = getCompliance(currentStream?.global_video_analysis['vrx'].compliance);
    const vrxHistGraphData = {
        barGraphic: vrxHistFinalData,
        title: mediaInfoHistogram,
        complianceInfo: complianceVrxHist,
        xAxisTitle: generalBufferLevel,
        yAxisTitle: '%',
        datakeyY: 'value',
        datakeyX: 'label',
        leftMargin: leftMarginVrxHist,
    };

    return (
        <>
            {!vrxData.isGrouped ? (
                <div className="pcap-details-page-line-graphic-container ">
                    <LineGraphic key={currentStream?.id} data={vrxLineGraphData} getNewData={setVrxData} />
                </div>
            ) : (
                <div className="pcap-details-page-line-graphic-container">
                    <MinMaxAvgLineGraphic
                        key={currentStream?.id}
                        data={vrxMinMaxAvgGraphData}
                        getNewData={setVrxData}
                    />
                </div>
            )}
            <div className="pcap-details-page-bar-graphic-container ">
                <BarGraphic key={currentStream?.id} barGraphicData={vrxHistGraphData} />
            </div>
        </>
    );
}

export default VrxAnalysis;
