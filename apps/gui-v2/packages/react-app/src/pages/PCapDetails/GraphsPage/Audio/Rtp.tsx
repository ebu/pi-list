import React from 'react';
import { MinMaxAvgLineGraphic, IGraphicMinMaxAvgData, LineGraphic } from 'components/index';
import SDK, { api } from '@bisect/ebu-list-sdk';
import list from 'utils/api';
import { getLeftMargin, getFinalData } from 'utils/graphs/dataTransformationLineGraphs';
import { translate } from 'utils/translation';
import { useGraphData } from 'utils/graphs/getGraphData';
import { getFinalDataMinMaxAvgGraph } from 'utils/graphs/dataTransformationMinMaxAvgGraph';

function Rtp({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;

    const [rtpData, setRtpData] = useGraphData({
        pcapID,
        streamID,
        measurementType: api.constants.measurements.AUDIO_PKT_TS_VS_RTP_TS,
        first_packet_ts,
        last_packet_ts,
    });

    const mediaInfoRtpDeltaPacketTimeRtpTime = translate('media_information.rtp.delta_packet_time_vs_rtp_time');
    const mediaInfoTimelime = translate('media_information.timeline');
    const MediaInfoDelay = translate('media_information.delay');

    if (!rtpData) return null;

    if (rtpData.data.length === 0) {
        return null;
    }

    const rtpFinalData = rtpData.isGrouped ? getFinalDataMinMaxAvgGraph(rtpData.data) : getFinalData(rtpData.data);

    const leftMargin = rtpData.isGrouped ? getLeftMargin(rtpData.data) : getLeftMargin(rtpFinalData!);

    const rtpLineGraphData = {
        graphicData: getFinalData(rtpFinalData!),
        title: mediaInfoRtpDeltaPacketTimeRtpTime,
        xAxisTitle: mediaInfoTimelime,
        yAxisTitle: MediaInfoDelay,
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMargin,
    };

    const rtpMinMaxAvgGraphData = {
        graphicData: getFinalDataMinMaxAvgGraph(rtpData.data!),
        title: mediaInfoRtpDeltaPacketTimeRtpTime,
        xAxisTitle: mediaInfoTimelime,
        yAxisTitle: MediaInfoDelay,
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMargin,
    };

    return (
        <>
            {!rtpData.isGrouped ? (
                <div className="pcap-details-page-line-graphic-container ">
                    <LineGraphic key={currentStream?.id} data={rtpLineGraphData} getNewData={setRtpData} />
                </div>
            ) : (
                <div className="pcap-details-page-line-graphic-container ">
                    <MinMaxAvgLineGraphic
                        key={currentStream?.id}
                        data={rtpMinMaxAvgGraphData}
                        getNewData={setRtpData}
                    />
                </div>
            )}
        </>
    );
}

export default Rtp;
