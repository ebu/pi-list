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

    const [cinstData, setCinstData] = React.useState<IGraphicTimeMaxData[]>([]);

    React.useEffect(() => {
        const loadCinstData = async (): Promise<void> => {
            const all = await list.stream.getCInstForStream(pcapID, streamID, first_packet_ts, last_packet_ts);
            const cinstFinalData = getFinalData(all);
            setCinstData(cinstFinalData as IGraphicTimeMaxData[]);
        };
        loadCinstData();
    }, [currentStream?.id]);

    const initialHist: IHistogram = { histogram: [] };
    const [cHistData, setcHistData] = React.useState(initialHist);

    React.useEffect(() => {
        const loadCHistData = async (): Promise<void> => {
            const all = await list.stream.getCInstHistogramForStream(pcapID, streamID);
            setcHistData(all);
        };
        loadCHistData();
    }, [currentStream?.id]);

    const mediaInfoRtpPacketCount = translate('media_information.rtp.packet_count');
    const generalBufferLevel = translate('general.buffer_level');

    if (cinstData.length === 0) {
        return null;
    }
    if (cHistData === undefined) {
        return null;
    }

    const leftMarginCinst = getLeftMargin(cinstData);
    const cinstGraphData = {
        graphicData: cinstData,
        title: 'Cinst',
        xAxisTitle: 'Time (TAI)',
        yAxisTitle: mediaInfoRtpPacketCount,
        datakeyY: 'max',
        datakeyX: 'time',
        leftMargin: leftMarginCinst,
    };

    const complianceCHist = getCompliance(currentStream?.global_video_analysis['cinst'].compliance);
    const cHistPercData: number[][] = getPercHistData(cHistData);
    const cHistFinalData = getFinalHistData(cHistPercData);
    const leftMarginCHist = getLeftMarginBarGraphic(cHistFinalData);
    const cHistGraphData = {
        barGraphic: cHistFinalData,
        title: 'C',
        complianceInfo: complianceCHist,
        xAxisTitle: generalBufferLevel,
        yAxisTitle: '%',
        datakeyY: 'value',
        datakeyX: 'label',
        leftMargin: leftMarginCHist,
    };

    return (
        <>
            <div className="pcap-details-page-line-graphic-container ">
                <LineGraphic key={currentStream?.id} data={cinstGraphData} />
            </div>
            <div className="pcap-details-page-bar-graphic-container ">
                <BarGraphic key={currentStream?.id} barGraphicData={cHistGraphData} />
            </div>
        </>
    );
}

export default CbufferAnalysis;
