import React from 'react';
import InfoPane from '../streamPage/components/InfoPane';
import ResultPane from '../streamPage/components/ResultPane';
import MinMaxDisplay from '../streamPage/components/MinMaxDisplay';

const nsPropAsMinMaxAvgUs = (info) => {
    if (_.isNil(info)) return { min: '---', max: '---', avg: '---'};
    const toUs = v => _.isNil(v) ? '---' : (v / 1000).toFixed(0);
    return { min: toUs(info.min), max: toUs(info.max), avg: toUs(info.avg)};
};

const RtpInfo = props => {
    const pktsPerFrameAnalysis = props.streamInfo.analyses.pkts_per_frame;
    const pktPerFrameRange = typeof pktsPerFrameAnalysis.details.range === 'null' ? '---' : pktsPerFrameAnalysis.details.range;
    const pktsFerFrameInvalid = pktsPerFrameAnalysis.result !== 'compliant';

    const deltaPktTsVsRtpTsAnalysis = props.streamInfo.analyses.packet_ts_vs_rtp_ts;
    const deltaPktTsVsRtpTsRange = typeof deltaPktTsVsRtpTsAnalysis.details.range === 'null' ? '---' : deltaPktTsVsRtpTsAnalysis.details.range;
    const deltaPktTsVsRtpTs_invalid = deltaPktTsVsRtpTsAnalysis.result !== 'compliant';

    const invalid = pktsFerFrameInvalid || deltaPktTsVsRtpTs_invalid;
    const summary = [
        {
            labelTag: 'stream.compliance',
            value: invalid? 'not compliant' : 'compliant',
            attention: invalid
        }
    ]

    const results = [
        {
            measurement: <MinMaxDisplay
                labelTag='media_information.video.packets_per_frame'
                min={pktPerFrameRange.min}
                max={pktPerFrameRange.max}
                units={pktsPerFrameAnalysis.details.unit}
                attention={pktsFerFrameInvalid}
            />,
            limit: <MinMaxDisplay
                label='range'
                min={pktsPerFrameAnalysis.details.limit.min}
                max='---'
                units={pktsPerFrameAnalysis.details.unit}
            />
        },
        {
            measurement: <MinMaxDisplay
                labelTag='media_information.rtp.delta_first_packet_time_vs_rtp_time'
                {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTsAnalysis.details.range)}
                units={'us'}
                attention={deltaPktTsVsRtpTs_invalid}
            />,
            limit: <MinMaxDisplay
                label='range'
                {...nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTsAnalysis.details.limit)}
                units={'us'}
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

export default RtpInfo;
