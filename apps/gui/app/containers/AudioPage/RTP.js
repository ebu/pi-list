import React from 'react';
import Panel from '../../components/common/Panel';
import LineChart from '../../components/LineChart';
import api from '../../utils/api';
import chartFormatters from '../../utils/chartFormatters';

const RTP = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;

    return (
        <Panel className="lst-stream-info-tab">
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <LineChart
                        asyncData={() =>
                            api.getAudioPktTsVsRtpTs(
                                props.pcapID,
                                props.streamID,
                                first_packet_ts,
                                last_packet_ts
                            )
                        }
                        xAxis={chartFormatters.getTimeLineLabel}
                        data={chartFormatters.singleValueLineChart}
                        titleTag="media_information.rtp.delta_packet_time_vs_rtp_time_ns"
                        yAxisLabel="Delay (μs)"
                        height={300}
                        lineWidth={3}
                        legend
                    />
                </div>
            </div>
        </Panel>
    );
};

export default RTP;
