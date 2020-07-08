import React from 'react';
import api from 'utils/api';
import Graphs from '../../components/graphs';

const dataAsMicroseconds = data => {
    const values = data.map(item => Object.assign(item, { value: item.value * 1e6 }));
    return values;
};

const TvdAnalysis = props => {
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
                <Graphs.Line
                    titleTag="Tvd"
                    titleParam={`TRoffset = TROdefault = ${default_tro} μs`}
                    xTitleTag="media_information.timeline"
                    yTitle="Value (μs)"
                    asyncGetter={() =>
                        api
                            .getDeltaToIdealTpr0Raw(pcapID, streamID, first_packet_ts, last_packet_ts)
                            .then(data => dataAsMicroseconds(data))
                    }
                />
                <Graphs.Line
                    titleTag="Adjusted Tvd"
                    titleParam={`TRoffset = Avg(FPO)  = ${avg_tro} μs`}
                    xTitleTag="media_information.timeline"
                    yTitle="Value (μs)"
                    asyncGetter={() =>
                        api
                            .getDeltaToIdealTpr0AdjustedAvgTroRaw(pcapID, streamID, first_packet_ts, last_packet_ts)
                            .then(data => dataAsMicroseconds(data))
                    }
                />
            </div>
        </div>
    );
};

export default TvdAnalysis;
