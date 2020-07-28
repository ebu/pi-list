import React from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import Graphs from '../../components/graphs';
import { histogramAsPercentages } from '../../components/graphs';

const CbufferAnalysis = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

    const ComposeChartTitle = value => {
        return `Cinst - ${value}`;
    };

    return (
        <div className="row">
            <div className="col-xs-12">
                <Graphs.Histogram
                    title="C"
                    xTitleTag="general.buffer_level"
                    yTitle="%"
                    asyncGetter={async () => {
                        const v = await api.getCInstHistogramForStream(pcapID, streamID);
                        return histogramAsPercentages(v);
                    }}
                />
                <Graphs.Line
                    title="Cinst"
                    xTitle="Time (TAI)"
                    yTitleTag="media_information.rtp.packet_count"
                    asyncGetter={async () =>
                        await api.getCInstForStream(pcapID, streamID, first_packet_ts, last_packet_ts)
                    }
                    layoutProperties={{ yaxis: { tickformat: ',d' } }}
                />
            </div>
        </div>
    );
};

CbufferAnalysis.propTypes = {
    streamID: PropTypes.string.isRequired,
    pcapID: PropTypes.string.isRequired,
};

export default CbufferAnalysis;
