import React from 'react';
import { LineGraphic, IGraphicTimeValueData, MinMaxAvgLineGraphic } from 'components/index';
import SDK, { api } from '@bisect/ebu-list-sdk';
import list from 'utils/api';
import { getFinalData, getDeltaFPTvsRTP, getLeftMargin } from 'utils/graphs/dataTransformationLineGraphs';
import { translate } from 'utils/translation';
import { useGraphData } from 'utils/graphs/getGraphData';
import '../../styles.scss';
import { getFinalDataMinMaxAvgGraph } from 'utils/graphs/dataTransformationMinMaxAvgGraph';

function RtpAnalysis({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [latencyData, setlatencyData] = useGraphData({
        pcapID,
        streamID,
        measurementType: api.constants.measurements.DELTA_PACKET_TIME_VS_RTP_TIME,
        first_packet_ts,
        last_packet_ts,
    });

    const [rtpTimeStepData, setRtpTimeStepData] = useGraphData({
        pcapID,
        streamID,
        measurementType: api.constants.measurements.DELTA_TO_PREVIOUS_RTP_TS,
        first_packet_ts,
        last_packet_ts,
    });

    const [rtpOffsetData, setRtpOffsetData] = useGraphData({
        pcapID,
        streamID,
        measurementType: api.constants.measurements.DELTA_RTP_VS_NT,
        first_packet_ts,
        last_packet_ts,
    });

    const mediaInfoRtpDelta = translate('media_information.rtp.delta_rtp_ts_vs_nt');
    const mediaInfoRtpTsStep = translate('media_information.rtp.rtp_ts_step');

    if (!rtpTimeStepData) return null;
    if (!latencyData) return null;
    if (!rtpOffsetData) return null;

    const rtpTimeStepFinalData = rtpTimeStepData.isGrouped
        ? getFinalDataMinMaxAvgGraph(rtpTimeStepData.data)
        : getFinalData(rtpTimeStepData.data);
    const latencyFinalData = latencyData.isGrouped
        ? getFinalDataMinMaxAvgGraph(latencyData.data)
        : getFinalData(latencyData.data);
    const rtpOffsetFinalData = rtpOffsetData.isGrouped
        ? getFinalDataMinMaxAvgGraph(rtpOffsetData.data)
        : getFinalData(rtpOffsetData.data);

    if (latencyData.data.length === 0) {
        return null;
    }
    if (rtpOffsetData.data.length === 0) {
        return null;
    }
    if (rtpTimeStepData.data.length === 0) {
        return null;
    }

    const leftMarginLatency = latencyData.isGrouped
        ? getLeftMargin(latencyData.data)
        : getLeftMargin(latencyFinalData!);
    const leftMarginRtpOffset = rtpOffsetData.isGrouped
        ? getLeftMargin(rtpOffsetData.data)
        : getLeftMargin(rtpOffsetFinalData!);
    const leftMarginRtpTimeStep = rtpTimeStepData.isGrouped
        ? getLeftMargin(rtpTimeStepData.data)
        : getLeftMargin(rtpTimeStepFinalData!);

    const latencyGraphLineGraphData = {
        graphicData: getFinalData(latencyFinalData!),
        title: 'Video latency',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'Latency (μs)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginLatency,
    };

    const latencyGraphMinMaxAvgGraphData = {
        graphicData: getFinalDataMinMaxAvgGraph(latencyData.data!),
        title: 'Video latency',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'Latency (μs)',
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMarginLatency,
    };

    const rtpOffsetLineGraphData = {
        graphicData: getFinalData(rtpOffsetFinalData!),
        title: (
            <>
                <span>RTP</span>
                <span style={{ verticalAlign: 'sub' }}>offset</span>
            </>
        ),
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'RTP offset (ticks)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginRtpOffset,
    };

    const rtpOffsetMinMaxAvgGraphData = {
        graphicData: getFinalDataMinMaxAvgGraph(rtpOffsetData.data),
        title: (
            <div>
                <span>Rtp</span>
                <span style={{ verticalAlign: 'sub', backgroundColor: 'red' }}></span>
            </div>
        ),
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'RTP offset (ticks)',
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMarginRtpOffset,
    };

    const rtpTimeStepLineGraphData = {
        graphicData: getFinalData(rtpTimeStepFinalData!),
        title: mediaInfoRtpTsStep,
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'RTP Time Step (ticks)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginRtpTimeStep,
    };

    const rtpTimeStepMinMaxAvgGraphData = {
        graphicData: getFinalDataMinMaxAvgGraph(rtpTimeStepData.data),
        title: mediaInfoRtpTsStep,
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'RTP Time Step (ticks)',
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMarginRtpTimeStep,
    };

    return (
        <>
            {!latencyData.isGrouped ? (
                <div className="pcap-details-page-line-graphic-container ">
                    <LineGraphic key={currentStream?.id} data={latencyGraphLineGraphData} getNewData={setlatencyData} />
                </div>
            ) : (
                <div className="pcap-details-page-line-graphic-container ">
                    <MinMaxAvgLineGraphic
                        key={currentStream?.id}
                        data={latencyGraphMinMaxAvgGraphData}
                        getNewData={setlatencyData}
                    />
                </div>
            )}
            {!rtpOffsetData.isGrouped ? (
                <div className="pcap-details-page-line-graphic-container ">
                    <LineGraphic key={currentStream?.id} data={rtpOffsetLineGraphData} getNewData={setRtpOffsetData} />
                </div>
            ) : (
                <div className="pcap-details-page-line-graphic-container ">
                    <MinMaxAvgLineGraphic
                        key={currentStream?.id}
                        data={rtpOffsetMinMaxAvgGraphData}
                        getNewData={setRtpOffsetData}
                    />
                </div>
            )}
            {!rtpTimeStepData.isGrouped ? (
                <div className="pcap-details-page-line-graphic-container ">
                    <LineGraphic
                        key={currentStream?.id}
                        data={rtpTimeStepLineGraphData}
                        getNewData={setRtpTimeStepData}
                    />
                </div>
            ) : (
                <div className="pcap-details-page-line-graphic-container ">
                    <MinMaxAvgLineGraphic
                        key={currentStream?.id}
                        data={rtpTimeStepMinMaxAvgGraphData}
                        getNewData={setRtpTimeStepData}
                    />
                </div>
            )}
        </>
    );
}

export default RtpAnalysis;
