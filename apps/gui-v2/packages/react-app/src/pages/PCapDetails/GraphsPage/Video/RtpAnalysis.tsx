import React from 'react';
import { LineGraphic, IGraphicTimeValueData } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import { getFinalData, getDeltaFPTvsRTP, getLeftMargin } from '../../../../utils/graphs/dataTransformationLineGraphs';
import { translate } from '../../../../utils/translation';
import '../../styles.scss';

function RtpAnalysis({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [latencyData, setlatencyData] = React.useState<IGraphicTimeValueData[]>([]);
    const [rtpOffsetData, setRtpOffsetData] = React.useState<IGraphicTimeValueData[]>([]);
    const [rtpTimeStepData, setRtpTimeStepData] = React.useState<IGraphicTimeValueData[]>([]);
    React.useEffect(() => {
        const loadLatencyData = async (): Promise<void> => {
            const all = await list.stream.getDeltaPacketTimeVsRtpTimeRaw(
                pcapID,
                streamID,
                first_packet_ts,
                last_packet_ts
            );
            const latencyFinalData = getFinalData(getDeltaFPTvsRTP(all));
            setlatencyData(latencyFinalData as IGraphicTimeValueData[]);
        };
        loadLatencyData();
    }, [currentStream?.id]);

    React.useEffect(() => {
        const loadRtpOffsetData = async (): Promise<void> => {
            const all = await list.stream.getDeltaRtpVsNtRaw(pcapID, streamID, first_packet_ts, last_packet_ts);
            setRtpOffsetData(getFinalData(all) as IGraphicTimeValueData[]);
        };
        loadRtpOffsetData();
    }, [currentStream?.id]);

    React.useEffect(() => {
        const loadRtpTimeStepData = async (): Promise<void> => {
            const all = await list.stream.getDeltaToPreviousRtpTsRaw(pcapID, streamID, first_packet_ts, last_packet_ts);
            setRtpTimeStepData(getFinalData(all) as IGraphicTimeValueData[]);
        };
        loadRtpTimeStepData();
    }, [currentStream?.id]);

    const mediaInfoRtpDelta = translate('media_information.rtp.delta_rtp_ts_vs_nt');
    const mediaInfoRtpTsStep = translate('media_information.rtp.rtp_ts_step');

    if (latencyData.length === 0) {
        return null;
    }
    if (rtpOffsetData.length === 0) {
        return null;
    }
    if (rtpTimeStepData.length === 0) {
        return null;
    }

    const leftMarginLatency = getLeftMargin(latencyData);
    const leftMarginRtpOffset = getLeftMargin(rtpOffsetData);
    const leftMarginRtpTimeStep = getLeftMargin(rtpTimeStepData);

    const latencyGraphData = {
        graphicData: latencyData,
        title: 'Latency',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'Latency (μs)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginLatency,
    };

    const rtpOffsetGraphData = {
        graphicData: rtpOffsetData,
        title: mediaInfoRtpDelta,
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'RTP offset (ticks)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginRtpOffset,
    };
    const rtpTimeStepGraphData = {
        graphicData: rtpTimeStepData,
        title: mediaInfoRtpTsStep,
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'RTP Time Step (ticks)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginRtpTimeStep,
    };

    return (
        <>
            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={latencyGraphData} />
            </div>
            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={rtpOffsetGraphData} />
            </div>
            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={rtpTimeStepGraphData} />
            </div>
        </>
    );
}

export default RtpAnalysis;
