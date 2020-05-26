import React from 'react';
import _ from 'lodash';
import InfoPane from '../streamPage/components/InfoPane';
import ResultPane from '../streamPage/components/ResultPane';
import MinMaxDisplay from '../streamPage/components/MinMaxDisplay';
import MinAvgMaxDisplay from '../streamPage/components/MinAvgMaxDisplay';
import { getComplianceSummary, nsPropAsMinMaxAvgUs, propAsMinMaxAvg } from '../../utils/stats.js'

const RtpInfo = props => {
    console.log(props.streamInfo)
    const pktsPerFrame = _.get(props.streamInfo, ['analyses', 'pkts_per_frame'], undefined);
    console.log(pktsPerFrame)
    const deltaPktTsVsRtpTs = _.get(props.streamInfo, ['analyses', 'packet_ts_vs_rtp_ts'], undefined);
    const interFrameRtpDelta = _.get(props.streamInfo, ['analyses', 'inter_frame_rtp_ts_delta'], undefined);

    const summary = [
        {
            labelTag: 'stream.compliance',
            ...getComplianceSummary([pktsPerFrame, deltaPktTsVsRtpTs, interFrameRtpDelta]),
        }
    ]

    const results = [
        {
            measurement: <MinMaxDisplay
                labelTag='media_information.video.packets_per_frame'
                {...propAsMinMaxAvg(pktsPerFrame.details.range, 1)}
                units={pktsPerFrame.details.unit}
                attention={pktsPerFrame.result !== 'compliant'}
            />,
            limit: <MinMaxDisplay
                label='range'
                min={pktsPerFrame.details.limit.min}
                max='---'
                units={pktsPerFrame.details.unit}
            />
        },
        {
            measurement: <MinMaxDisplay
                labelTag='media_information.rtp.delta_first_packet_time_vs_rtp_time'
                {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs.details.range)}
                units={'us'}
                attention={deltaPktTsVsRtpTs.result !== 'compliant'}
            />,
            limit: <MinMaxDisplay
                label='range'
                {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs.details.limit)}
                units={'us'}
            />
        },
        {
            measurement: (
                <MinAvgMaxDisplay
                    labelTag="media_information.rtp.inter_frame_rtp_ts_delta"
                    units="ticks"
                    {...propAsMinMaxAvg(interFrameRtpDelta.details.range, 1)}
                    attention={interFrameRtpDelta.result !== 'compliant'}
                />
            ),
            limit: (
                <MinMaxDisplay
                    labelTag="range"
                    {...interFrameRtpDelta.details.limit}
                    units={interFrameRtpDelta.details.unit}
                />
            ),
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

export default RtpInfo;
