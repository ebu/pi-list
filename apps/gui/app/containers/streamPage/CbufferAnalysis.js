import React, { Component } from 'react';
import api from 'utils/api';
import chartFormatters from 'utils/chartFormatters';
import SectionHeader from 'components/common/SectionHeader';
import Chart from 'components/Chart';

class CbufferAnalysis extends Component {

    render() {
        const streamInfo = this.props.streamInfo;
        const statistics = streamInfo.statistics;
        const mediaInfo = streamInfo.media_specific;

        const { first_packet_ts, last_packet_ts } = streamInfo.statistics;
        const { streamID, pcapID } = this.props;

        return (
            <div className="row">
                <div className="col-xs-12 col-md-12">
                    <Chart
                        type="bar"
                        request={() => api.getCInstHistogramForStream(pcapID, streamID)}
                        labels={chartFormatters.cinstHistogramValues}
                        formatData={chartFormatters.cinstHistogramCounts}
                        xLabel=""
                        title="CInst"
                        height={300}
                        yLabel="Count"
                        displayXTicks="true"
                    />
                </div>
                <div className="col-xs-12 col-md-12">
                    <Chart
                        type="line"
                        request={() => api.getCInstForStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
                        labels={chartFormatters.getTimeLineLabel}
                        formatData={chartFormatters.stdDeviationMeanMinMaxChart}
                        xLabel=""
                        title="CInst"
                        height={300}
                        legend="true"
                    />
                </div>
            </div>
        );
    }
}

export default CbufferAnalysis;
