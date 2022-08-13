import React from 'react';
import { LineGraphic, IGraphicTimeMaxData, BarGraphic, MinMaxAvgLineGraphic } from 'components/index';
import SDK, { api } from '@bisect/ebu-list-sdk';
import list from 'utils/api';
import { getFinalData, getLeftMargin } from 'utils/graphs/dataTransformationLineGraphs';
import {
    IHistogram,
    getFinalHistData,
    getLeftMarginBarGraphic,
    getPercHistData,
    getCompliance,
} from 'utils/graphs/dataTransformationBarGraphs';
import { useGraphData } from 'utils/graphs/getGraphData';
import { translate } from 'utils/translation';
import { getFinalDataMinMaxAvgGraph } from 'utils/graphs/dataTransformationMinMaxAvgGraph';

function CbufferAnalysis({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [cinstData, setCinstData] = useGraphData({
        pcapID,
        streamID,
        measurementType: api.constants.measurements.C_INST,
        first_packet_ts,
        last_packet_ts,
    });

    const initialHist: IHistogram = { histogram: [] };
    const [cHistData, setcHistData] = React.useState(initialHist);

    React.useEffect(() => {
        setcHistData(initialHist);
        const loadCHistData = async (): Promise<void> => {
            const all = await list.stream.getCInstHistogramForStream(pcapID, streamID);
            setcHistData(all);
        };
        loadCHistData();
    }, [currentStream?.id]);

    const mediaInfoRtpPacketCount = translate('media_information.rtp.packet_count');
    const generalBufferLevel = translate('general.buffer_level');

    if (!cinstData) return null;

    const cinstFinalData = cinstData.isGrouped
        ? getFinalDataMinMaxAvgGraph(cinstData.data)
        : getFinalData(cinstData.data);

    if (cHistData === undefined) {
        return null;
    }

    const leftMarginCinst = cinstData.isGrouped ? getLeftMargin(cinstData.data) : getLeftMargin(cinstFinalData!);

    const cinstLineGraphData = {
        graphicData: getFinalData(cinstFinalData!),
        title: (
            <>
                <span>C</span>
                <span style={{ verticalAlign: 'sub', fontSize: '0.75em' }}>inst</span>
            </>
        ),
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: mediaInfoRtpPacketCount,
        datakeyY: 'max',
        datakeyX: 'time',
        leftMargin: leftMarginCinst,
    };

    const cinstMinMaxAvgGraphData = {
        graphicData: getFinalDataMinMaxAvgGraph(cinstData.data!),
        title: (
            <>
                <span>C</span>
                <span style={{ verticalAlign: 'sub', fontSize: '0.75em' }}>inst</span>
            </>
        ),
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: mediaInfoRtpPacketCount,
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMarginCinst,
    };

    const complianceCHist = getCompliance(currentStream?.global_video_analysis?.cinst?.compliance);
    const cHistPercData: number[][] = getPercHistData(cHistData);
    const cHistFinalData = getFinalHistData(cHistPercData);
    const leftMarginCHist = getLeftMarginBarGraphic(cHistFinalData);
    const cHistGraphData = {
        barGraphic: cHistFinalData,
        title: 'Cinst histogram',
        complianceInfo: complianceCHist,
        xAxisTitle: generalBufferLevel,
        yAxisTitle: '%',
        datakeyY: 'value',
        datakeyX: 'label',
        leftMargin: leftMarginCHist,
    };

    return (
        <>
            {!cinstData.isGrouped ? (
                <div className="pcap-details-page-line-graphic-container ">
                    <LineGraphic key={currentStream?.id} data={cinstLineGraphData} getNewData={setCinstData} />
                </div>
            ) : (
                <div className="pcap-details-page-line-graphic-container ">
                    <MinMaxAvgLineGraphic
                        key={currentStream?.id}
                        data={cinstMinMaxAvgGraphData}
                        getNewData={setCinstData}
                    />
                </div>
            )}
            <div className="pcap-details-page-bar-graphic-container ">
                <BarGraphic key={currentStream?.id} barGraphicData={cHistGraphData} />
            </div>
        </>
    );
}

export default CbufferAnalysis;
