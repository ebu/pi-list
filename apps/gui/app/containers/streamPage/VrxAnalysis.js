import React from 'react';
import api from 'utils/api';
import chartFormatters from 'utils/chartFormatters';
import Chart from 'components/Chart';

const VrxAnalysis = (props) => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    return (
        <div className="row">
            <div className="col-xs-12 col-md-12">
                <Chart
                    type="line"
                    request={() => api.getVrxIdealForStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    labels={chartFormatters.getTimeLineLabel}
                    formatData={chartFormatters.minMaxChart}
                    xLabel=""
                    title="Tvd = Ideal"
                    height={300}
                    legend="true"
                />
                <Chart
                    type="line"
                    request={() => api.getVrxFirstPacketFirstFrameFromStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    labels={chartFormatters.getTimeLineLabel}
                    formatData={chartFormatters.minMaxChart}
                    xLabel=""
                    title="Tvd = 1st Packet of 1st Frame"
                    height={300}
                    legend="true"
                />
                <Chart
                    type="line"
                    request={() => api.getVrxFirstPacketEachFrame(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    labels={chartFormatters.getTimeLineLabel}
                    formatData={chartFormatters.minMaxChart}
                    xLabel=""
                    title="Tvd = 1st Packet Each Frame"
                    height={300}
                    legend="true"
                />
                <Chart
                    type="line"
                    request={() => api.getDeltaToIdealTpr0Raw(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    labels={chartFormatters.getTimeLineLabel}
                    formatData={chartFormatters.singleValueChart}
                    xLabel=""
                    title="Delta to Ideal TPR0"
                    height={300}
                    legend="true"
                    yLabel="s"
                />
            </div>
        </div>
    );
};

export default VrxAnalysis;
