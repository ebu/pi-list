import React, { Fragment } from 'react';
import InfoPane from './components/InfoPane';
import DataList from './components/DataList';
import MultiValueDisplay from './components/MultiValueDisplay';
import NarrowWideDisplay from './components/NarrowWideDisplay';

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

const MinAvgMaxDisplay = ({ label, units, min, avg, max }) => {
    const values = [
        { label: 'min', value: min },
        { label: 'avg', value: avg },
        { label: 'max', value: max },
    ];
    return <MultiValueDisplay label={label} units={units} values={values} />;
};


const CinstDisplay = props => (
    <MinAvgMaxDisplay
        label={<span>C<sub>INST</sub></span>}
        units="packets"
        {...props}
    />
);

const VrxDisplay = props => (
    <MinAvgMaxDisplay
        label="VRX"
        units="packets"
        {...props}
    />
);

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
    const vrxmin = getLowestFromHistogram(props.vrx.histogram);
    const vrxpeak = getHighestFromHistogram(props.vrx.histogram);

    const summaryValues = [
        {
            labelTag: 'stream.compliance',
            ...getCompliance(props.compliance)
        },
        {
            labelTag: 'media_information.video.read_schedule',
            value: props.schedule === 'gapped' ? 'Gapped' : 'Linear'
        }];

    return (
        <div>
            <InfoPane
                icon="ondemand_video"
                heading="ST2110-21"
                values={[]}
            />
            <div className="row">
                <div className="col-xs-12 col-md-12">
                    <DataList values={summaryValues} />
                </div>
            </div>
            <hr className="lst-stream-info2-divider" />
            <div className="row">
                <div className="col-xs-6 col-md-6">
                    <CinstDisplay min={cmin} avg={'---'} max={cpeak} />
                </div>
                <div className="col-xs-6 col-md-6">
                    <NarrowWideDisplay label={<span>C<sub>MAX</sub></span>} units="packets" narrow={props.cinst.cmax_narrow} wide={props.cinst.cmax_wide} />
                </div>
            </div>
            <hr className="lst-stream-info2-divider" />
            <div className="row">
                <div className="col-xs-6 col-md-6">
                    <VrxDisplay min={vrxmin} avg={'---'} max={vrxpeak} />
                </div>
                <div className="col-xs-6 col-md-6">
                    <NarrowWideDisplay label={<span>VRX<sub>FULL</sub></span>} units="packets" narrow={props.vrx.vrx_full_narrow} wide={props.vrx.vrx_full_wide} />
                </div>
            </div>
            <hr className="lst-stream-info2-divider" />
            <div className="row lst-stream-info2-row">
                <div className="col-xs-6 col-md-6">
                    <TpaDisplay {...props} />
                </div>
                <div className="col-xs-6 col-md-6">
                    <TroDefaultDisplay value={props.tro_default_ns} />
                </div>
            </div>
            <hr className="lst-stream-info2-divider" />
        </div>
    );
};

export default Dash21Info;
