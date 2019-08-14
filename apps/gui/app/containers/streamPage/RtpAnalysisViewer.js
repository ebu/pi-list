import React from 'react';
import api from 'utils/api';
import chartFormatters from '../../utils/chartFormatters';
import LineChart from '../../components/LineChart';

const RtpAnalysisViewer = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    const getTimeDataAsMicroseconds = async () => {
        const values = await api.getDeltaPacketTimeVsRtpTimeRaw(
            pcapID,
            streamID,
            first_packet_ts,
            last_packet_ts
        );
        return values.map(v => {
            return { ...v, value: v.value / 1000 };
        });
    };

    return (
        <div className="row">
            <div className="col-xs-12">
                <LineChart
                    asyncData={getTimeDataAsMicroseconds}
                    xAxis={chartFormatters.getTimeLineLabel}
                    data={chartFormatters.singleValueLineChart}
                    title="Delta from Packet time to RTP time"
                    yAxisLabel="μs"
                    height={300}
                    lineWidth={3}
                />
                <LineChart
                    asyncData={() =>
                        api.getDeltaRtpTsVsPacketTsRaw(
                            pcapID,
                            streamID,
                            first_packet_ts,
                            last_packet_ts
                        )
                    }
                    xAxis={chartFormatters.getTimeLineLabel}
                    data={chartFormatters.singleValueLineChart}
                    title="Delta from RTP TS to Packet TS"
                    yAxisLabel="Ticks"
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
                    title="Delta from RTP TS to NxTframe"
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
                    title="TS Delta to previous RTP packet"
                    yAxisLabel="Ticks"
                    height={300}
                    lineWidth={3}
                />
            </div>
        </div>
    );
};

export default RtpAnalysisViewer;
