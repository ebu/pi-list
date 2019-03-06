import React, { Fragment } from 'react';
import InfoPane from './components/InfoPane';

const AudioInfo = props => {
    const values = [
        {
            labelTag: 'media_information.audio.encoding',
            value: props.encoding
        },
        {
            labelTag: 'media_information.audio.number_channels',
            value: props.number_channels
        },
        {
            labelTag: 'media_information.audio.sampling',
            value: props.sampling
        },
        {
            labelTag: 'media_information.audio.packet_time',
            value: props.packet_time
        }
    ];

    return (<InfoPane
        icon="audiotrack"
        headingTag="headings.audio"
        values={values}
    />);
};

export default AudioInfo;
