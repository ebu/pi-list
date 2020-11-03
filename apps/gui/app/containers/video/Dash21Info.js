import React from 'react';
import _ from 'lodash';
import InfoPane from '../streamPage/components/InfoPane';
import ResultPane from '../streamPage/components/ResultPane';
import MultiValueDisplay from '../streamPage/components/MultiValueDisplay';
import NarrowWideDisplay from '../streamPage/components/NarrowWideDisplay';
import MinAvgMaxDisplay from '../streamPage/components/MinAvgMaxDisplay';
import { getAverageFromHistogram, getLowestFromHistogram, getHighestFromHistogram } from '../../utils/stats.js';
import { translateX } from 'utils/translation';

const getCompliance = value => {
    if (value === 'narrow') {
        return { value: 'N', units: '(narrow)' };
    }

    if (value === 'narrow_linear') {
        return { value: 'NL', units: '(narrow linear)' };
    }

    if (value === 'wide') {
        return { value: 'W', units: '(Wide)' };
    }

    return { value: 'Not compliant', attention: false };
};

const nsAsMicroseconds = value => (value / 1000).toFixed(3);

const FpoDisplay = props => (
    <MinAvgMaxDisplay
        label={<span>FPT</span>}
        units="μs"
        min={nsAsMicroseconds(props.min_tro_ns)}
        avg={nsAsMicroseconds(props.avg_tro_ns)}
        max={nsAsMicroseconds(props.max_tro_ns)}
    />
);

const RegularInterPacketTimeDisplay = ({ data }) => (
    <MinAvgMaxDisplay label={<span>Inter-packet time</span>} units="ns" min={data.min} avg={data.avg} max={data.max} />
);

const GapInterPacketTimeDisplay = ({ data }) => (
    <MinAvgMaxDisplay
        label={<span>Gap</span>}
        units="μs"
        min={nsAsMicroseconds(data.min)}
        avg={nsAsMicroseconds(data.avg)}
        max={nsAsMicroseconds(data.max)}
    />
);

const TroDefaultDisplay = props => {
    const value = (props.value / 1000).toFixed(3);
    return (
        <MultiValueDisplay
            label={
                <span>
                    TRO<sub>DEFAULT</sub>
                </span>
            }
            units="μs"
            values={[{ label: '', value: value }]}
            min={nsAsMicroseconds(props.min_tro_ns)}
            avg={nsAsMicroseconds(props.avg_tro_ns)}
            max={nsAsMicroseconds(props.max_tro_ns)}
        />
    );
};

const Dash21Info = props => {
    const globalVideoAnalysis = props.info.global_video_analysis;
    const cmin = getLowestFromHistogram(globalVideoAnalysis.cinst.histogram);
    const cpeak = getHighestFromHistogram(globalVideoAnalysis.cinst.histogram);
    const cavg = getAverageFromHistogram(globalVideoAnalysis.cinst.histogram);
    const vrxmin = getLowestFromHistogram(globalVideoAnalysis.vrx.histogram);
    const vrxpeak = getHighestFromHistogram(globalVideoAnalysis.vrx.histogram);
    const vrxavg = getAverageFromHistogram(globalVideoAnalysis.vrx.histogram);
    const invalidCinst = props.info.analyses['2110_21_cinst'].result !== 'compliant';
    const invalidVrx = props.info.analyses['2110_21_vrx'].result !== 'compliant';
    const interPacketSpacing = _.get(props.info, 'network_information.inter_packet_spacing');
    const gapData = interPacketSpacing && interPacketSpacing.after_m_bit;
    const interPacketData = interPacketSpacing && interPacketSpacing.regular;

    const summaryValues = [
        { labelTag: 'stream.compliance', ...getCompliance(globalVideoAnalysis.compliance) },
        {
            labelTag: 'media_information.video.read_schedule',
            value:
                typeof props.info.media_specific.schedule !== 'undefined'
                    ? props.info.media_specific.schedule
                    : translateX('headings.unknown'),
        },
        {
            labelTag: 'Trs',
            value: globalVideoAnalysis.trs
                ? (globalVideoAnalysis.trs.trs_ns / 1000).toFixed(3) + ' µs'
                : translateX('headings.unknown'),
        },
    ];

    const results = [
        {
            measurement: (
                <MinAvgMaxDisplay
                    label={
                        <span>
                            C<sub>INST</sub>
                        </span>
                    }
                    units="packets"
                    min={cmin}
                    avg={cavg.toFixed(3)}
                    max={cpeak}
                    attention={invalidCinst}
                />
            ),
            limit: (
                <NarrowWideDisplay
                    label={
                        <span>
                            C<sub>MAX</sub>
                        </span>
                    }
                    units="packets"
                    narrow={globalVideoAnalysis.cinst.cmax_narrow}
                    wide={globalVideoAnalysis.cinst.cmax_wide}
                />
            ),
        },
        {
            measurement: (
                <MinAvgMaxDisplay
                    label="VRX"
                    units="packets"
                    min={vrxmin}
                    avg={vrxavg.toFixed(3)}
                    max={vrxpeak}
                    attention={invalidVrx}
                />
            ),
            limit: (
                <NarrowWideDisplay
                    label={
                        <span>
                            VRX<sub>FULL</sub>
                        </span>
                    }
                    units="packets"
                    narrow={globalVideoAnalysis.vrx.vrx_full_narrow}
                    wide={globalVideoAnalysis.vrx.vrx_full_wide}
                />
            ),
        },
        {
            measurement: <FpoDisplay {...props.info.media_specific} />,
            limit: <TroDefaultDisplay value={props.info.media_specific.tro_default_ns} />,
        },
        {
            measurement: <GapInterPacketTimeDisplay data={gapData} />,
        },
        {
            measurement: <RegularInterPacketTimeDisplay data={interPacketData} />,
        },
    ];

    console.log(JSON.stringify(props.info));
    return (
        <div>
            <InfoPane icon="alarm_on" heading="ST2110-21" values={summaryValues} />
            <ResultPane values={results} />
        </div>
    );
};

export default Dash21Info;
