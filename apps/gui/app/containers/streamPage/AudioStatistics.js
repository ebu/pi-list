import React from 'react';
import InfoPane from './components/InfoPane';

const AudioStatistics = props => {

    const tsdfMax = (props.tsdf_max === null || props.tsdf_max === undefined) ? '---' : props.tsdf_max;

    const values = [
        {
            labelTag: 'media_information.audio.number_samples',
            value: props.sample_count
        },
        {
            labelTag: 'media_information.audio.sample_size',
            value: props.sample_size,
            units: 'bytes'
        },
        {
            labelTag: 'media_information.audio.samples_per_packet',
            value: props.samples_per_packet
        },
        {
            labelTag: 'media_information.audio.tsdf_max',
            value: tsdfMax,
            units: 'μs'
        }
    ];

    return (<InfoPane
        icon="queue_music"
        headingTag="headings.audio_measurements"
        values={values}
    />);
};

export default AudioStatistics;
