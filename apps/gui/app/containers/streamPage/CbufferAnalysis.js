import React from 'react';
import api from 'utils/api';
import chartFormatters from 'utils/chartFormatters';
import Chart, { CHART_COLORS } from 'components/Chart';
import LineChart from "components/LineChart";

const CbufferAnalysis = (props) => {
    const {first_packet_ts, last_packet_ts} = props.streamInfo.statistics;
    const {streamID, pcapID} = props;

    return (
        <div className="row">
            <div className="col-xs-12 col-md-12">
                <Chart
                    type="bar"
                    request={() => api.getCInstHistogramForStream(pcapID, streamID)}
                    labels={chartFormatters.cinstHistogramValues}
                    formatData={chartFormatters.cinstHistogramCounts}
                    xLabel=""
                    title="Cinst - Histogram"
                    height={300}
                    yLabel="Count"
                    displayXTicks="true"
                />
                <LineChart
                    asyncData={() => api.getCInstForStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.stdDeviationMeanMinMaxLineChart}
                    title="Cinst - Timeline"
                    height={300}
                    lineWidth={3}
                    legend
                />
            </div>
        </div>
    );
};

export default CbufferAnalysis;
