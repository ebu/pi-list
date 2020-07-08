import React from 'react';
import Panel from '../../components/common/Panel';
import Graphs from '../../components/graphs';
import api from '../../utils/api';

import chartFormatters from '../../utils/chartFormatters';
import Chart from '../../components/StyledChart';
import { translateX } from '../../utils/translation';

const dataAsMicroseconds = data => {
    return data.map(item => Object.assign(item, { value: item.value / 1000 }));
};

const RtpCharts = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    return (
        <Panel className="lst-stream-info-tab">
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <Chart
                        type="bar"
                        request={() => api.getAncillaryPktPerFrameHistogram(pcapID, streamID)}
                        labels={chartFormatters.histogramValues}
                        formatData={chartFormatters.histogramCounts}
                        xLabel={translateX('media_information.packets')}
                        titleTag=""
                        title={translateX('media_information.video.packets_per_frame')}
                        height={300}
                        yLabel={translateX('media_information.count')}
                        displayXTicks="true"
                    />
                </div>
                <div className="col-xs-12 col-md-6">
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
                <div className="col-xs-12 col-md-12">
                    <Graphs.Line
                        titleTag="media_information.rtp.delta_first_packet_time_vs_rtp_time"
                        xTitleTag="media_information.timeline"
                        yTitle="Value (μs)"
                        asyncGetter={() =>
                            api
                                .getDeltaPacketTimeVsRtpTimeRaw( props.pcapID, props.streamID, first_packet_ts, last_packet_ts)
                                .then(data => dataAsMicroseconds(data))
                        }
                    />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-12">
                    <Graphs.Line
                        titleTag="media_information.rtp.rtp_ts_step"
                        xTitleTag="media_information.timeline"
                        yTitleTag="media_information.ticks"
                        asyncGetter={() =>
                            api.getDeltaToPreviousRtpTsRaw(
                                pcapID,
                                streamID,
                                first_packet_ts,
                                last_packet_ts
                            )
                        }
                    />
                </div>
            </div>
        </Panel>
    );
};

export default RtpCharts;
