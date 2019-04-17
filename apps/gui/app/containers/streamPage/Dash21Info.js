import React, { Fragment } from 'react';
import InfoPane from './components/InfoPane';
import DataList from './components/DataList';
import MultiValueDisplay from './components/MultiValueDisplay';
import NarrowWideDisplay from './components/NarrowWideDisplay';
import MinAvgMaxDisplay from './components/MinAvgMaxDisplay';

const getAverageFromHistogram = (hist) => {
    if (!hist || hist.length === 0) return 0;

    const avg = hist.reduce((prev, curr) => {
        return prev + (curr[0] * curr[1] / 100);
    }, 0);

    return avg;
};

const getLowestFromHistogram = (hist) => {
    if (!hist || hist.length === 0) return 0;
    return hist[0][0];
};

const getHighestFromHistogram = (hist) => {
    if (!hist || hist.length === 0) return 0;
    return hist[hist.length - 1][0];
};

const getCompliance = (value) => {
    if (value == 'narrow') {
        return { value: 'N', units: '(narrow)' };
    } else if (value == 'narrow_linear') {
        return { value: 'NL', units: '(narrow linear)' };
    } else if (value == 'wide') {
        return { value: 'W', units: '(Wide)' };
    } else {
        return { value: 'Not compliant' };
    }
};

const nsAsMicroseconds = value => (value / 1000).toFixed(3);

const TpaDisplay = props => (
    <MinAvgMaxDisplay
        label={<span>TPA<sub>0</sub></span>}
        units="μs"
        min={nsAsMicroseconds(props.min_tro_ns)}
        avg={nsAsMicroseconds(props.avg_tro_ns)}
        max={nsAsMicroseconds(props.max_tro_ns)}
    />
);

const TroDefaultDisplay = props => {
    const value = (props.value / 1000).toFixed(3);
    return (<MultiValueDisplay
        label={<span>TRO<sub>DEFAULT</sub></span>}
        units="μs"
        values={[{ label: '', value: value }]}
        min={nsAsMicroseconds(props.min_tro_ns)}
        avg={nsAsMicroseconds(props.avg_tro_ns)}
        max={nsAsMicroseconds(props.max_tro_ns)}
    />);
};


const Dash21Info = (props) => {
    const cmin = getLowestFromHistogram(props.cinst.histogram);
    const cpeak = getHighestFromHistogram(props.cinst.histogram);
    const cavg = getAverageFromHistogram(props.cinst.histogram);
    const vrxmin = getLowestFromHistogram(props.vrx.histogram);
    const vrxpeak = getHighestFromHistogram(props.vrx.histogram);
    const vrxavg = getAverageFromHistogram(props.vrx.histogram);

    const summaryValues = [
        {
            labelTag: 'stream.compliance',
            ...getCompliance(props.compliance)
        },
        {
            labelTag: 'media_information.video.read_schedule',
            value: props.schedule === 'gapped' ? 'Gapped' : 'Linear'
        }
    ];

    return (
        <div>
            <InfoPane
                icon="alarm_on"
                heading="ST2110-21"
                values={[]}
            />
            <div className="row">
                <div className="col-xs-12">
                    <DataList values={summaryValues} />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-6">
                    <MinAvgMaxDisplay
                        label={<span>C<sub>INST</sub></span>}
                        units="packets"
                        min={cmin}
                        avg={vrxavg.toFixed(3)}
                        max={cpeak}
                    />
                </div>
                <div className="col-xs-6">
                    <NarrowWideDisplay label={<span>C<sub>MAX</sub></span>} units="packets" narrow={props.cinst.cmax_narrow} wide={props.cinst.cmax_wide} />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-6">
                    <MinAvgMaxDisplay
                        label="VRX"
                        units="packets"
                        min={vrxmin} avg={vrxavg.toFixed(3)} max={vrxpeak}
                    />
                </div>
                <div className="col-xs-6">
                    <NarrowWideDisplay label={<span>VRX<sub>FULL</sub></span>} units="packets" narrow={props.vrx.vrx_full_narrow} wide={props.vrx.vrx_full_wide} />
                </div>
            </div>
            <div className="row lst-stream-info2-row">
                <div className="col-xs-6">
                    <TpaDisplay {...props} />
                </div>
                <div className="col-xs-6">
                    <TroDefaultDisplay value={props.tro_default_ns} />
                </div>
            </div>
        </div>
    );
};

export default Dash21Info;
