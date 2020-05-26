import React from 'react';
import Panel from '../../components/common/Panel';
import LineChart from '../../components/LineChart';
import api from '../../utils/api';
import chartFormatters from '../../utils/chartFormatters';
import Chart from '../../components/StyledChart';
import { translateX } from '../../utils/translation';

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
                    <LineChart
                        asyncData={() =>
                            api.getPacketsPerFrame(props.pcapID, props.streamID, first_packet_ts, last_packet_ts)
                        }
                        xAxis={chartFormatters.getTimeLineLabel}
                        data={chartFormatters.singleValueLineChart}
                        titleTag="media_information.video.packets_per_frame"
                        yAxisLabel={translateX('media_information.packets')}
                        height={300}
                        lineWidth={3}
                        legend
                    />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-12">
                    <LineChart
                        asyncData={async () => {
                            const values = await api.getDeltaPacketTimeVsRtpTimeRaw(
                                props.pcapID,
                                props.streamID,
                                first_packet_ts,
                                last_packet_ts
                            );
                            return values.map(v => {
                                return { ...v, value: v.value / 1000 };
                            });
                        }}
                        xAxis={chartFormatters.getTimeLineLabel}
                        data={chartFormatters.singleValueLineChart}
                        titleTag="media_information.rtp.delta_first_packet_time_vs_rtp_time"
                        yAxisLabel="us"
                        height={300}
                        lineWidth={3}
                        legend
                    />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-12">
                    <LineChart
                        asyncData={() =>
                            api.getDeltaToPreviousRtpTsRaw(
                                pcapID,
                                streamID,
                                first_packet_ts,
                                last_packet_ts
                            )
                        }
                        xAxis={chartFormatters.getTimeLineLabel}
                        data={chartFormatters.singleValueLineChart}
                        titleTag='media_information.rtp.rtp_ts_step'
                        yAxisLabel={translateX('media_information.ticks')}
                        height={300}
                        lineWidth={3}
                    />
                </div>
            </div>
        </Panel>
    );
};

export default RtpCharts;
