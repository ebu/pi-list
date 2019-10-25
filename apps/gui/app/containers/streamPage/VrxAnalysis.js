import React from 'react';
import api from '../../utils/api';
import LineChart from '../../components/LineChart';
import chartFormatters from '../../utils/chartFormatters';
import Chart from '../../components/StyledChart';

const dataAsNanoseconds = (data) => {
    const values = data.map(item => Object.assign(item, { value: item.value * 1e9 }));
    return values;
};

const isPointNull = p => p.max === null || p.min === null;

const trimNull = data => {
    while(data.length > 0 && isPointNull(data[0])) {
        data = data.splice(1, data.length); 
    }

    return data;
};

const VrxAnalysis = (props) => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;
    const default_tro = props.streamInfo.media_specific.tro_default_ns / 1000;
    const avg_tro = props.streamInfo.media_specific.avg_tro_ns / 1000;

    return (
        <div className="row">
            <div className="col-xs-12">
                <Chart
                    type="bar"
                    request={() => api.getVrxHistogramForStream(pcapID, streamID)}
                    labels={chartFormatters.cinstHistogramValues}
                    formatData={chartFormatters.cinstHistogramCounts}
                    xLabel="packets"
                    title="VRX - Histogram"
                    height={300}
                    yLabel="Count"
                    displayXTicks="true"
                />
                <LineChart
                    asyncData={() => api.getVrxIdealForStream(pcapID, streamID, first_packet_ts, last_packet_ts).then(trimNull)}
                    xAxis={item => item.time}
                    data={chartFormatters.statsLineChart}
                    title={`VRX (with TRoffset = TROdefault = ${default_tro} μs)`}
                    yAxisLabel="packets"
                    height={300}
                    lineWidth={3}
                    legend
                />
                <LineChart
                    asyncData={() => api.getVrxAdjustedAvgTro(pcapID, streamID, first_packet_ts, last_packet_ts).then(trimNull)}
                    xAxis={item => item.time}
                    data={chartFormatters.statsLineChart}
                    title={`Adjusted VRX (with TRoffset = Avg(FPO) = ${avg_tro} μs)`}
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
