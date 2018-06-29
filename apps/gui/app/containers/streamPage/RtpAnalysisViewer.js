import React from 'react';
import api from 'utils/api';
import chartFormatters from 'utils/chartFormatters';
import Chart from 'components/Chart';

const RtpAnalysisViewer = (props) => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

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
};

export default RtpAnalysisViewer;
