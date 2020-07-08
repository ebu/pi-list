import React from 'react';
import api from 'utils/api';
import { translateX } from 'utils/translation';
import Graphs from '../../components/graphs';

const RtpAnalysisViewer = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    const getDeltaFPTvsRTP = async () => {
        const values = await api.getDeltaPacketTimeVsRtpTimeRaw(pcapID, streamID, first_packet_ts, last_packet_ts);
        return values.map(v => {
            return { ...v, value: v.value / 1000 };
        });
    };
    const getDeltaRTPvsNT = () => api.getDeltaRtpVsNtRaw(pcapID, streamID, first_packet_ts, last_packet_ts);
    const getDeltaToPreviousRTP = () => api.getDeltaToPreviousRtpTsRaw(pcapID, streamID, first_packet_ts, last_packet_ts);

    return (
        <div className="row">
            <div className="col-xs-12">
                <Graphs.Line
                    titleTag="media_information.rtp.delta_first_packet_time_vs_rtp_time"
                    xTitle="Absolute time"
                    yTitle="Value (μs)"
                    asyncGetter={getDeltaFPTvsRTP}
                />

                <Graphs.Line
                    titleTag="media_information.rtp.delta_rtp_ts_vs_nt"
                    xTitle="Absolute time"
                    yTitleTag="media_information.ticks"
                    asyncGetter={getDeltaRTPvsNT}
                />

                <Graphs.Line
                    titleTag="media_information.rtp.rtp_ts_step"
                    xTitle="Absolute time"
                    yTitleTag="media_information.ticks"
                    asyncGetter={getDeltaToPreviousRTP}
                />
            </div>
        </div>
    );
};

export default RtpAnalysisViewer;
