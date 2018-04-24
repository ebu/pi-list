import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import api from 'utils/api';
import chartFormatters from 'utils/chartFormatters';
import SectionHeader from 'components/common/SectionHeader';
import Chart from 'components/Chart';

class RtpAnalysisViewer extends Component {

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
                        type="line"
                        request={() => api.getDeltaRtpTsVsPacketTsRaw(pcapID, streamID, first_packet_ts, last_packet_ts)}
                        labels={chartFormatters.getTimeLineLabel}
                        formatData={chartFormatters.singleValueChart}
                        xLabel=""
                        title="Delta from RTP TS to Packet TS"
                        height={300}
                        yLabel="Ticks"
                    />
                    <Chart
                        type="line"
                        request={() => api.getDeltaRtpVsNtRaw(pcapID, streamID, first_packet_ts, last_packet_ts)}
                        labels={chartFormatters.getTimeLineLabel}
                        formatData={chartFormatters.singleValueChart}
                        xLabel=""
                        title="Delta from RTP TS to NxTframe"
                        height={300}
                        yLabel="Ticks"
                    />
                    <Chart
                        type="line"
                        request={() => api.getDeltaToPreviousRtpTsRaw(pcapID, streamID, first_packet_ts, last_packet_ts)}
                        labels={chartFormatters.getTimeLineLabel}
                        formatData={chartFormatters.singleValueChart}
                        xLabel=""
                        title="TS Delta to previous RTP packet"
                        height={300}
                        yLabel="Ticks"
                    />
                </div>
            </div>
        );
    }
}

export default RtpAnalysisViewer;
