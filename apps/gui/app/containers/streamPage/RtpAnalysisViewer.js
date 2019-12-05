import React from 'react';
import api from 'utils/api';
import chartFormatters from '../../utils/chartFormatters';
import LineChart from '../../components/LineChart';
import { translateX } from 'utils/translation';

const RtpAnalysisViewer = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    return (
        <div className="row">
            <div className="col-xs-12">
                <LineChart
                    asyncData={async () => {
                            const values = await api.getDeltaPacketTimeVsRtpTimeRaw(
                                pcapID,
                                streamID,
                                first_packet_ts,
                                last_packet_ts
                            );
                            return values.map(v => {
                                return { ...v, value: v.value / 1000 };
                            });
                        }
                    }
                    xAxis={chartFormatters.getTimeLineLabel}
                    data={chartFormatters.singleValueLineChart}
                    title={translateX('media_information.rtp.delta_first_packet_time_vs_rtp_time')}
                    yAxisLabel="μs"
                    height={300}
                    lineWidth={3}
                />
                <LineChart
                    asyncData={() =>
                        api.getDeltaRtpVsNtRaw(
                            pcapID,
                            streamID,
                            first_packet_ts,
                            last_packet_ts
                        )
                    }
                    xAxis={chartFormatters.getTimeLineLabel}
                    data={chartFormatters.singleValueLineChart}
                    title={translateX('media_information.rtp.delta_rtp_ts_vs_nt')}
                    yAxisLabel="Ticks"
                    height={300}
                    lineWidth={3}
                />
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
                    title={translateX('media_information.rtp.rtp_ts_step')}
                    yAxisLabel="Ticks"
                    height={300}
                    lineWidth={3}
                />
            </div>
        </div>
    );
};

export default RtpAnalysisViewer;
