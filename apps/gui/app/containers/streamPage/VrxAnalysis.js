import React from 'react';
import api from 'utils/api';
import LineChart from "components/LineChart";
import chartFormatters from 'utils/chartFormatters';

const VrxAnalysis = (props) => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    return (
        <div className="row">
            <div className="col-xs-12 col-md-12">
                <LineChart
                    asyncData={() => api.getVrxIdealForStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={(item) => item.time}
                    data={chartFormatters.minMaxLineChart}
                    title="Tvd = Ideal"
                    height={300}
                    lineWidth={3}
                    legend
                />
                <LineChart
                    asyncData={() => api.getVrxFirstPacketFirstFrameFromStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={(item) => item.time}
                    data={chartFormatters.minMaxLineChart}
                    title="Tvd = 1st Packet of 1st Frame"
                    height={300}
                    lineWidth={3}
                    legend
                />
                <LineChart
                    asyncData={() => api.getVrxFirstPacketEachFrame(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.minMaxLineChart}
                    title="Tvd = 1st Packet Each Frame"
                    height={300}
                    lineWidth={3}
                    legend
                />
                <LineChart
                    asyncData={() => api.getDeltaToIdealTpr0Raw(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.singleValueLineChart}
                    title="Delta to Ideal TPR0"
                    yAxisLabel="s"
                    height={300}
                    lineWidth={3}
                />
            </div>
        </div>
    );
};

export default VrxAnalysis;
