import React from 'react';
import api from 'utils/api';
import LineChart from 'components/LineChart';
import chartFormatters from 'utils/chartFormatters';
import { translateX } from 'utils/translation';

const dataAsNanoseconds = (data) => {
    const values = data.map(item => Object.assign(item, { value : item.value * 1e9}));
    return values;
};
const VrxAnalysis = (props) => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;
    const default_tro = props.streamInfo.media_specific.tro_default_ns / 1000;
    const avg_tro = props.streamInfo.media_specific.avg_tro_ns / 1000;


    const ComposeChartTitle = (value) => {
            return "VRX - " + value;
    }

    const ComposeComplexChartTitle = (translation, value) => {
            return translation + " " + value + " μs";
    }

    return (
        <div className="row">
            <div className="col-xs-12">
                <LineChart
                    asyncData={() => api.getDeltaToIdealTpr0Raw(pcapID, streamID, first_packet_ts, last_packet_ts).then(data => dataAsNanoseconds(data))}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.singleValueLineChart}
                    title={ComposeComplexChartTitle(translateX('media_information.tvd'),default_tro)}
                    yAxisLabel="ns"
                    height={300}
                    lineWidth={3}
                />
                <LineChart
                    asyncData={() => api.getDeltaToIdealTpr0AdjustedAvgTroRaw(pcapID, streamID, first_packet_ts, last_packet_ts).then(data => dataAsNanoseconds(data))}
                    xAxis={chartFormatters.xAxisTimeDomain}
                    data={chartFormatters.singleValueLineChart}
                    title={ComposeComplexChartTitle(translateX('media_information.tvd_adjusted'),avg_tro)}
                    yAxisLabel="ns"
                    height={300}
                    lineWidth={3}
                />
            </div>
        </div>
    );
};

export default VrxAnalysis;
