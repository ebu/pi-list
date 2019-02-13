import React from 'react';
import api from 'utils/api';
import LineChart from 'components/LineChart';
import chartFormatters from 'utils/chartFormatters';

const dataAsNanoseconds = (data) => {
    const values = data.map(item => Object.assign(item, { value : item.value * 1e9}));
    return values;
};
const VrxAnalysis = (props) => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    return (
        <div className="row">
            <div className="col-xs-12 col-md-12">
                <LineChart
                    asyncData={() => api.getVrxIdealForStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={item => item.time}
                    data={chartFormatters.minMaxLineChart}
                    title="VRX (with TRoffset = TROdefault)"
                    yAxisLabel="packets"
                    height={300}
                    lineWidth={3}
                    legend
                />
                <LineChart
                    asyncData={() => api.getVrxAdjustedAvgTro(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={item => item.time}
                    data={chartFormatters.minMaxLineChart}
                    title="VRX (with TRoffset = Measured/Averaged)"
                    yAxisLabel="packets"
                    height={300}
                    lineWidth={3}
                    legend
                />
            </div>
        </div>
    );
};

export default VrxAnalysis;
