import React from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import Graphs from '../../components/graphs';

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
                    titleTag="media_information.histogram"
                    xTitleTag="media_information.timeline"
                    yTitleTag="media_information.rtp.packet_count"
                    asyncGetter={async () => {
                        const v = await api.getCInstHistogramForStream(pcapID, streamID);
                        return v && v.histogram;
                    }}
                />
                <Graphs.Line
                    title="Cinst"
                    xTitleTag="media_information.timeline"
                    yTitleTag="media_information.rtp.packet_count"
                    asyncGetter={() => api.getCInstForStream(pcapID, streamID, first_packet_ts, last_packet_ts)}
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
