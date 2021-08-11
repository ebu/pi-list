import React from 'react';
import { MinMaxAvgLineGraphic, IGraphicMinMaxAvgData } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import { getLeftMargin } from '../../../../utils/graphs/dataTransformationLineGraphs';
import { translate } from '../../../../utils/translation';

function Rtp({ currentStream, pcapID }: { currentStream: SDK.types.IStreamInfo | undefined; pcapID: string }) {
    const streamID = currentStream?.id;
    const first_packet_ts = currentStream?.statistics.first_packet_ts;
    const last_packet_ts = currentStream?.statistics.last_packet_ts;
    const grouped_ts = Math.round(
        (parseInt(last_packet_ts || '0') - parseInt(first_packet_ts || '0')) / 1000
    ).toString();

    const [rtpData, setRtpData] = React.useState<IGraphicMinMaxAvgData[]>([]);

    React.useEffect(() => {
        const loadRtpData = async (): Promise<void> => {
            const all = await list.stream.getAudioPktTsVsRtpTsGrouped(
                pcapID,
                streamID,
                first_packet_ts,
                last_packet_ts,
                grouped_ts
            );
            setRtpData(all);
        };
        loadRtpData();
    }, [currentStream?.id]);

    const mediaInfoRtpDeltaPacketTimeRtpTime = translate('media_information.rtp.delta_packet_time_vs_rtp_time');
    const mediaInfoTimelime = translate('media_information.timeline');
    const MediaInfoDelay = translate('media_information.delay');

    if (rtpData.length === 0) {
        return null;
    }
    const leftMargin = getLeftMargin(rtpData);

    const rtpGraphData = {
        graphicData: rtpData,
        title: mediaInfoRtpDeltaPacketTimeRtpTime,
        xAxisTitle: mediaInfoTimelime,
        yAxisTitle: MediaInfoDelay,
        datakeyY: ['min', 'avg', 'max'],
        datakeyX: 'time',
        leftMargin: leftMargin,
    };

    return <MinMaxAvgLineGraphic key={currentStream?.id} data={rtpGraphData} />;
}

export default Rtp;
