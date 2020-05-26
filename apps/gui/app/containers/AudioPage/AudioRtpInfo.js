import React from 'react';
import _ from 'lodash';
import InfoPane from '../streamPage/components/InfoPane';
import ResultPane from '../streamPage/components/ResultPane';
import MinMaxDisplay from '../streamPage/components/MinMaxDisplay';
import { getComplianceSummary, nsPropAsMinMaxAvgUs, propAsMinMaxAvg } from '../../utils/stats.js'

const AudioRtpInfo = props => {
    const deltaPktTsVsRtpTs = _.get(props.streamInfo, ['analyses', 'packet_ts_vs_rtp_ts'], undefined);

    const summary = [
        {
            labelTag: 'stream.compliance',
            ...getComplianceSummary([deltaPktTsVsRtpTs]),
        }
    ]

    const results = [
        {
            measurement: <MinMaxDisplay
                labelTag='media_information.rtp.delta_packet_time_vs_rtp_time'
                {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs.details.range)}
                attention={deltaPktTsVsRtpTs.result !== 'compliant'}
                units="μs"
            />,
            limit: <MinMaxDisplay
                label='range'
                {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs.details.limit)}
                units="μs"
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
