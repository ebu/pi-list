import React from 'react';
import Panel from '../../components/common/Panel';
import Graphs from '../../components/graphs';
import api from '../../utils/api';
import { histogramAsPercentages } from '../../components/graphs';

const dataAsMicroseconds = data => {
    return data.map(item => Object.assign(item, { value: item.value / 1000 }));
};

const RtpCharts = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    return (
        <Panel className="lst-stream-info-tab">
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <Graphs.Histogram
                        titleTag="media_information.video.packets_per_frame"
                        xTitleTag="media_information.video.packets_per_frame"
                        yTitle="%"
                        asyncGetter={async () => {
                            const v = await api.getAncillaryPktPerFrameHistogram(pcapID, streamID);
                            return histogramAsPercentages(v);
                        }}
                    />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <Graphs.Line
                        titleTag="media_information.video.packets_per_frame"
                        xTitleTag="media_information.timeline"
                        yTitleTag="media_information.packets"
                        asyncGetter={() =>
                            api.getPacketsPerFrame(props.pcapID, props.streamID, first_packet_ts, last_packet_ts)
                        }
                    />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <Graphs.Line
                        titleTag="media_information.rtp.delta_first_packet_time_vs_rtp_time"
                        xTitleTag="media_information.timeline"
                        yTitle="Value (μs)"
                        asyncGetter={() =>
                            api
                                .getDeltaPacketTimeVsRtpTimeRaw(
                                    props.pcapID,
                                    props.streamID,
                                    first_packet_ts,
                                    last_packet_ts
                                )
                                .then(data => dataAsMicroseconds(data))
                        }
                    />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <Graphs.Line
                        titleTag="media_information.rtp.rtp_ts_step"
                        xTitleTag="media_information.timeline"
                        yTitleTag="media_information.ticks"
                        asyncGetter={() =>
                            api.getDeltaToPreviousRtpTsRaw(pcapID, streamID, first_packet_ts, last_packet_ts)
                        }
                    />
                </div>
            </div>
        </Panel>
    );
};

export default RtpCharts;
