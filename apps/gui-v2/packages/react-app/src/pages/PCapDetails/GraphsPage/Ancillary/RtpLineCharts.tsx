import React from 'react';
import { LineGraphic, IGraphicTimeValueData, BarGraphic } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import { getFinalData, getLeftMargin, getDeltaFPTvsRTP } from '../../../../utils/graphs/dataTransformationLineGraphs';
import {
    IHistogram,
    getFinalHistData,
    getLeftMarginBarGraphic,
    getPercHistData,
    getCompliance,
} from '../../../../utils/graphs/dataTransformationBarGraphs';
import { translate } from '../../../../utils/translation';
import '../../styles.scss';

function RtpLineCharts({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [packetsFrameData, setpacketsFrameData] = React.useState<IGraphicTimeValueData[]>([]);
    const [latencyData, setlatencyData] = React.useState<IGraphicTimeValueData[]>([]);
    const [rtpTimeStepData, setRtpTimeStepData] = React.useState<IGraphicTimeValueData[]>([]);

    React.useEffect(() => {
        setpacketsFrameData([]);
        const loadPacketsFrameData = async (): Promise<void> => {
            const all = await list.stream.getPacketsPerFrame(pcapID, streamID, first_packet_ts, last_packet_ts);
            const normalized = Array.isArray(all) ? all : (Array.isArray((all as any)?.data) ? (all as any).data : []);
            const packetsFrameFinalData = getFinalData(normalized);
            setpacketsFrameData(packetsFrameFinalData as IGraphicTimeValueData[]);
        };
        loadPacketsFrameData();
    }, [currentStream?.id]);

    React.useEffect(() => {
        setlatencyData([]);
        const loadLatencyData = async (): Promise<void> => {
            const all = await list.stream.getDeltaPacketTimeVsRtpTimeRaw(
                pcapID,
                streamID,
                first_packet_ts,
                last_packet_ts
            );
            const normalized = Array.isArray(all) ? all : (Array.isArray((all as any)?.data) ? (all as any).data : []);
            const latencyFinalData = getFinalData(getDeltaFPTvsRTP(normalized));
            setlatencyData(latencyFinalData as IGraphicTimeValueData[]);
        };
        loadLatencyData();
    }, [currentStream?.id]);

    React.useEffect(() => {
        setRtpTimeStepData([]);
        const loadRtpTimeStepData = async (): Promise<void> => {
            const all = await list.stream.getDeltaToPreviousRtpTsRaw(pcapID, streamID, first_packet_ts, last_packet_ts);
            const normalized = Array.isArray(all) ? all : (Array.isArray((all as any)?.data) ? (all as any).data : []);
            const rtpTimeStepFinalData = getFinalData(normalized);
            setRtpTimeStepData(rtpTimeStepFinalData as IGraphicTimeValueData[]);
        };
        loadRtpTimeStepData();
    }, [currentStream?.id]);

    const initialHist: IHistogram = { histogram: [] };
    const [packetsFrameHistData, setpacketsFrameHistData] = React.useState(initialHist);

    React.useEffect(() => {
        setpacketsFrameHistData(initialHist);
        const loadPacketsFrameHistData = async (): Promise<void> => {
            const all = await list.stream.getAncillaryPktPerFrameHistogram(pcapID, streamID);
            setpacketsFrameHistData(all);
        };
        loadPacketsFrameHistData();
    }, [currentStream?.id]);

    const mediaInfoVideoPacket = translate('media_information.video.packets_per_frame');
    const mediaInfoTimelime = translate('media_information.timeline');
    const mediaInfoPacket = translate('media_information.packets');
    const mediaInfoRtpTsStep = translate('media_information.rtp.rtp_ts_step');
    const mediaInfoVideoPacketPerFrame = translate('media_information.video.packets_per_frame');

    if (packetsFrameData.length === 0) {
        return null;
    }
    if (latencyData.length === 0) {
        return null;
    }
    if (rtpTimeStepData.length === 0) {
        return null;
    }

    if (packetsFrameHistData === undefined) {
        return null;
    }

    const leftMarginPacketsFrame = getLeftMargin(packetsFrameData);
    const leftMarginLatency = getLeftMargin(latencyData);
    const leftMarginRtpTimeStep = getLeftMargin(rtpTimeStepData);

    const packetsFrameGraphData = {
        graphicData: packetsFrameData,
        title: mediaInfoVideoPacket,
        xAxisTitle: mediaInfoTimelime,
        yAxisTitle: mediaInfoPacket,
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginPacketsFrame,
    };

    const latencyGraphData = {
        graphicData: latencyData,
        title: 'Ancillary latency',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: 'Latency (μs)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginLatency,
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

    const packetsFrameHistPercData: number[][] = getPercHistData(packetsFrameHistData);
    const packetsFrameHistFinalData = getFinalHistData(packetsFrameHistPercData);
    const leftMarginPacketsFrameHist = getLeftMarginBarGraphic(packetsFrameHistFinalData);
    const compliancePacketsFrameHist = getCompliance(currentStream?.analyses.pkts_per_frame.result || undefined);
    const yDomainPercent: [number | string, number | string] = [0, 100];
    const packetsFrameHistGraphData = {
        barGraphic: packetsFrameHistFinalData,
        title: mediaInfoVideoPacketPerFrame,
        complianceInfo: compliancePacketsFrameHist,
        xAxisTitle: mediaInfoVideoPacketPerFrame,
        yAxisTitle: '%',
        datakeyY: 'value',
        datakeyX: 'label',
        leftMargin: leftMarginPacketsFrameHist,
        yDomain: yDomainPercent,
    };

    return (
        <>
            <div className="pcap-details-page-bar-graphic-container ">
                <BarGraphic key={currentStream?.id} barGraphicData={packetsFrameHistGraphData} />
            </div>
            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={packetsFrameGraphData} />
            </div>
            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={latencyGraphData} />
            </div>

            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={rtpTimeStepGraphData} />
            </div>
        </>
    );
}

export default RtpLineCharts;
