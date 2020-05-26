import React, { Fragment } from 'react';
import _ from 'lodash';
import InfoPane from './components/InfoPane';
import ResultPane from './components/ResultPane';
import MinAvgMaxDisplay from './components/MinAvgMaxDisplay';
import MinMaxDisplay from './components/MinMaxDisplay';
import { getComplianceSummary, nsPropAsMinMaxAvgUs, propAsMinMaxAvg } from '../../utils/stats.js'
const isRtpCompliant = info => {};

const RtpInfo = ({ info }) => {
    const deltaPktTsVsRtpTs = _.get(info, ['analyses', 'packet_ts_vs_rtp_ts'], undefined);
    const deltaRtpTsVsNTFrame = _.get(info, ['analyses', 'rtp_ts_vs_nt'], undefined);
    const interFrameRtpDelta = _.get(info, ['analyses', 'inter_frame_rtp_ts_delta'], undefined);

    const summaryValues = [
        {
            labelTag: 'stream.compliance',
            ...getComplianceSummary([deltaPktTsVsRtpTs, deltaRtpTsVsNTFrame, interFrameRtpDelta]),
        },
    ];

    const results = [
        {
            measurement: (
                <MinAvgMaxDisplay
                    labelTag="media_information.rtp.delta_first_packet_time_vs_rtp_time"
                    units="μs"
                    {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs.details.range)}
                    attention={deltaPktTsVsRtpTs.result !== 'compliant'}
                />
            ),
            limit: (
                <MinMaxDisplay labelTag="range" units="μs" {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs.details.limit)} />
            ),
        },
        {
            measurement: (
                <MinAvgMaxDisplay
                    labelTag="media_information.rtp.delta_rtp_ts_vs_nt"
                    units="ticks"
                    {...propAsMinMaxAvg(deltaRtpTsVsNTFrame.details.range)}
                    attention={deltaRtpTsVsNTFrame.result !== 'compliant'}
                />
            ),
            limit: (
                <MinMaxDisplay
                    labelTag="range"
                    units={deltaRtpTsVsNTFrame.details.unit}
                    {...deltaRtpTsVsNTFrame.details.limit}
                />
            ),
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
                    units={interFrameRtpDelta.details.unit}
                    {...interFrameRtpDelta.details.limit}
                />
            ),
        },
    ];
    return (
        <div>
            <InfoPane icon="blur_linear" heading="RTP" values={summaryValues} />
            <ResultPane values={results} />
        </div>
    );
};

export default RtpInfo;
