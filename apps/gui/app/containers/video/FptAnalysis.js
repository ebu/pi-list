import React from 'react';
import api from 'utils/api';
import Graphs from '../../components/graphs';

const dataAsMicroseconds = data => {
    const values = data.map(item => Object.assign(item, { value: item.value * 1e6 }));
    return values;
};

const FptAnalysis = props => {
    const { first_packet_ts, last_packet_ts } = props.streamInfo.statistics;
    const { streamID, pcapID } = props;

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
                    title="First Packet Time"
                    xTitle="Time (TAI)"
                    yTitle="FPT (μs)"
                    asyncGetter={() =>
                        api
                            .getDeltaToIdealTpr0Raw(pcapID, streamID, first_packet_ts, last_packet_ts)
                            .then(data => dataAsMicroseconds(data))
                    }
                    layoutProperties={{ yaxis: { tickformat: ',.3f' } }}
                />
            </div>
        </div>
    );
};

export default FptAnalysis;
