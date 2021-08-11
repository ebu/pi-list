import React from 'react';
import { LineGraphic, IGraphicTimeMaxData, BarGraphic } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import { getFinalData, getLeftMargin } from '../../../../utils/graphs/dataTransformationLineGraphs';
import {
    IHistogram,
    getFinalHistData,
    getLeftMarginBarGraphic,
    getPercHistData,
    getCompliance,
} from '../../../../utils/graphs/dataTransformationBarGraphs';
import { translate } from '../../../../utils/translation';

function VrxAnalysis({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [vrxData, setVrxData] = React.useState<IGraphicTimeMaxData[]>([]);

    React.useEffect(() => {
        const loadVrxData = async (): Promise<void> => {
            const all = await list.stream.getVrxIdealForStream(pcapID, streamID, first_packet_ts, last_packet_ts);
            setVrxData(getFinalData(all) as IGraphicTimeMaxData[]);
        };
        loadVrxData();
    }, [currentStream?.id]);

    const initialHist: IHistogram = { histogram: [] };
    const [vrxHistData, setVrxHistData] = React.useState(initialHist);

    React.useEffect(() => {
        const loadVrxHistData = async (): Promise<void> => {
            const all = await list.stream.getVrxHistogramForStream(pcapID, streamID);
            setVrxHistData(all);
        };
        loadVrxHistData();
    }, [currentStream?.id]);

    const mediaInfoHistogram = translate('media_information.histogram');
    const generalBufferLevel = translate('general.buffer_level');
    const mediaInfoRtpPacketCount = translate('media_information.rtp.packet_count');

    if (vrxData.length === 0) {
        return null;
    }
    if (vrxHistData === undefined) {
        return null;
    }

    const leftMarginVrx = getLeftMargin(vrxData);
    const vrxGraphData = {
        graphicData: vrxData,
        title: 'Vrx',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: mediaInfoRtpPacketCount,
        datakeyY: 'max',
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
            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={vrxGraphData} />
            </div>
            <div className="pcap-details-page-bar-graphic-container ">
                <BarGraphic key={currentStream?.id} barGraphicData={vrxHistGraphData} />
            </div>
        </>
    );
}

export default VrxAnalysis;
