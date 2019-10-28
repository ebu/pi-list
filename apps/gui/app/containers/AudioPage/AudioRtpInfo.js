import React from 'react';
import InfoPane from '../streamPage/components/InfoPane';
import ResultPane from '../streamPage/components/ResultPane';
import MinMaxDisplay from '../streamPage/components/MinMaxDisplay';

const AudioRtpInfo = props => {
    const analysis = props.streamInfo.analyses.packet_ts_vs_rtp_ts;
    const range = typeof analysis.details.range === 'null' ? '---' : analysis.details.range;
    const invalid = analysis.result !== 'compliant';

    const summary = [
        {
            labelTag: 'stream.compliance',
            value:analysis.result,
            attention:invalid
        }
    ]

    const results = [
        {
            measurement: <MinMaxDisplay
                labelTag='media_information.rtp.delta_packet_time_vs_rtp_time_ns'
                min={range.min}
                max={range.max}
                units={analysis.details.unit}
                attention={invalid}
            />,
            limit: <MinMaxDisplay
                label='range'
                min={analysis.details.limit.min}
                max={analysis.details.limit.max}
                units={analysis.details.unit}
            />
        },
    ];

    return (
        <div>
            <InfoPane
                icon='blur_linear'
                heading='RTP'
                values={summary}
            />
            <ResultPane
                values={results}
            />
        </div>
    );
};

export default AudioRtpInfo;
