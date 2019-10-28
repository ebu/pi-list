import React, { Fragment } from 'react';
import InfoPane from './components/InfoPane';

const AudioInfo = props => {
    const values = [
        {
            labelTag: 'media_information.audio.sampling',
            value: props.sampling,
            units: 'Hz'
        },
        {
            labelTag: 'media_information.audio.encoding',
            value: props.encoding,
            units: 'bits'
        },
        {
            labelTag: 'media_information.audio.number_channels',
            value: props.number_channels,
            units: 'ch'
        },
        {
            labelTag: 'media_information.audio.packet_time',
            value: parseFloat(props.packet_time).toFixed(3),
            units: 'ms'
        },
        {
            labelTag: 'media_information.audio.number_samples',
            value: props.sample_count
        },
        {
            labelTag: 'media_information.audio.samples_per_packet',
            value: props.samples_per_packet
        },
        {
            labelTag: 'media_information.audio.packet_size',
            value: props.packet_size,
            units: 'bytes'
        },
    ];

    return (<InfoPane
        icon="audiotrack"
        headingTag="headings.audio"
        values={values}
    />);
};

export default AudioInfo;
