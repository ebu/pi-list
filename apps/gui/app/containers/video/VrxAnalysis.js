import React from 'react';
import api from '../../utils/api';
import Graphs from '../../components/graphs';
import { histogramAsPercentages } from '../../components/graphs';

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

    return (
        <div className="row">
            <div className="col-xs-12">
                <Graphs.Histogram
                    titleTag="media_information.histogram"
                    xTitleTag="general.buffer_level"
                    yTitle="%"
                    asyncGetter={async () => {
                        const v = await api.getVrxHistogramForStream(pcapID, streamID);
                        return histogramAsPercentages(v);
                    }}
                />
                <Graphs.Line
                    title="VRX"
                    xTitle="Time (TAI)"
                    yTitleTag="media_information.rtp.packet_count"
                    asyncGetter={() =>
                        api.getVrxIdealForStream(pcapID, streamID, first_packet_ts, last_packet_ts).then(trimNull)
                    }
                    layoutProperties={{ yaxis: { tickformat: ',d' } }}
                />
            </div>
        </div>
    );
};

export default VrxAnalysis;
