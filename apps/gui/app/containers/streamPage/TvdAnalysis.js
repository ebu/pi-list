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
                    asyncData={() => api.getDeltaToIdealTpr0Raw(pcapID, streamID, first_packet_ts, last_packet_ts).then(data => dataAsNanoseconds(data))}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.singleValueLineChart}
                    title="TVD (with TRoffset = TROdefault)"
                    yAxisLabel="nanoseconds"
                    height={300}
                    lineWidth={3}
                />
                <LineChart
                    asyncData={() => api.getDeltaToIdealTpr0AdjustedAvgTroRaw(pcapID, streamID, first_packet_ts, last_packet_ts).then(data => dataAsNanoseconds(data))}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.singleValueLineChart}
                    title="TVD (with TRoffset = Measured/Averaged)"
                    yAxisLabel="nanoseconds"
                    height={300}
                    lineWidth={3}
                />
            </div>
        </div>
    );
};

export default VrxAnalysis;
