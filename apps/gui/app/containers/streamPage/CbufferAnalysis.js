import React from 'react';
import api from '../../utils/api';
import chartFormatters from '../../utils/chartFormatters';
import Chart from '../../components/StyledChart';
import LineChart from '../../components/LineChart';
import { translateX } from 'utils/translation';

const CbufferAnalysis = (props) => {
    const {first_packet_ts, last_packet_ts} = props.streamInfo.statistics;
    const {streamID, pcapID} = props;

    const ComposeChartTitle = (value) => {
            return "Cinst - " + value;
    }

    return (
        <div className="row">
            <div className="col-xs-12">
                <Chart
                    type="bar"
                    request={() => api.getCInstHistogramForStream(pcapID, streamID)}
                    labels={chartFormatters.histogramValues}
                    formatData={chartFormatters.histogramCounts}
                    xLabel={translateX('media_information.rtp.packet_count')}  //RS
                    title={ComposeChartTitle(translateX('media_information.histogram'))}  //RS
                    height={300}
                    yLabel={translateX('media_information.rtp.count')}  //RS
                    displayXTicks="true"
                />
                <LineChart
                    asyncData={() => api.getCInstForStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.statsLineChart}
                    title={ComposeChartTitle(translateX('media_information.timeline'))}
                    yAxisLabel={translateX('media_information.rtp.packet_count')}
                    height={300}
                    lineWidth={3}
                    legend
                />
            </div>
        </div>
    );
};

export default CbufferAnalysis;
