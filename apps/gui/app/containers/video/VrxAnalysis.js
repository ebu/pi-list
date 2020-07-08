import React from 'react';
import api from '../../utils/api';
import Graphs from '../../components/graphs';
import Chart from '../../components/StyledChart';
import chartFormatters from '../../utils/chartFormatters';
import { translateX } from '../../utils/translation';

const isPointNull = p => p.max === null || p.min === null;

const trimNull = data => {
    while (data.length > 0 && isPointNull(data[0])) {
        data = data.splice(1, data.length);
    }

    return data;
};

const VrxAnalysis = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;
    const default_tro = props.streamInfo.media_specific.tro_default_ns / 1000;
    const avg_tro = props.streamInfo.media_specific.avg_tro_ns / 1000;

    const ComposeChartTitle = value => {
        return 'VRX - ' + value;
    };

    const ComposeComplexChartTitle = (translation, value) => {
        return translation + ' ' + value + ' μs';
    };

    return (
        <div className="row">
            <div className="col-xs-12">
                <Graphs.Histogram
                    titleTag="media_information.histogram"
                    xTitleTag="media_information.timeline"
                    yTitleTag="media_information.rtp.packet_count"
                    asyncGetter={async () => {
                        const v = await api.getVrxHistogramForStream(pcapID, streamID);
                        return v && v.histogram;
                    }}
                />
                {/* <Chart
                    type="bar"
                    labels={chartFormatters.histogramValues}
                    formatData={chartFormatters.histogramCounts}
                    xLabel={translateX('media_information.rtp.packet_count')}
                    title={ComposeChartTitle(translateX('media_information.histogram'))}
                    height={300}
                    yLabel={translateX('media_information.rtp.count')}
                    displayXTicks="true"
                /> */}
                <Graphs.Line
                    title="Vrx"
                    titleParam={`TRoffset = TROdefault = ${default_tro} μs`}
                    xTitleTag="media_information.timeline"
                    yTitleTag="media_information.rtp.packet_count"
                    asyncGetter={() =>
                        api.getVrxIdealForStream(pcapID, streamID, first_packet_ts, last_packet_ts).then(trimNull)
                    }
                />
                <Graphs.Line
                    title="Adjusted Vrx"
                    titleParam={`TRoffset = TROdefault = ${default_tro} μs`}
                    xTitleTag="media_information.timeline"
                    yTitleTag="media_information.rtp.packet_count"
                    asyncGetter={() =>
                        api.getVrxAdjustedAvgTro(pcapID, streamID, first_packet_ts, last_packet_ts).then(trimNull)
                    }
                />
            </div>
        </div>
    );
};

export default VrxAnalysis;
