import React, { Fragment } from 'react';
import { translateX } from '../../utils/translation';
import Timecode from 'smpte-timecode';
import InfoPane from './components/InfoPane';

const getTimeCode = (props) => {
    try {
        return new Timecode(props.frame_count, Math.ceil(props.rate), false).toString();
    } catch (e) {
        return '00:00:00:00';
    }
};

const VideoInfo = (props) => {
    const size = `${props.width}x${props.height}`;
    const isInterlaced = props.scan_type === 'interlaced';

    const rate = typeof(props.rate) === 'string' ? props.rate : props.rate.toFixed(2).toString();

    const values = [
        {
            labelTag: 'media_information.video.dimensions',
            value: size
        },
        {
            labelTag: 'media_information.video.sampling',
            value: props.sampling
        },
        {
            labelTag: 'media_information.video.scan_type',
            value: translateX(isInterlaced ?
                'media_information.video.interlaced' :
                'media_information.video.progressive')
        },
        {
            labelTag: props.is_interlaced ?
                'media_information.video.field_rate' :
                'media_information.video.frame_rate',
            value: rate,
            units: 'Hz'
        },
        {
            labelTag: 'media_information.media_time',
            value: getTimeCode(props)
        },
        {
            labelTag: props.is_interlaced ?
                'media_information.video.fields' :
                'media_information.video.frames',
            value: props.frame_count
        },
        {
            labelTag: 'media_information.video.packets_per_frame',
            value: props.packets_per_frame
        }
    ];

    return (<InfoPane
        icon="ondemand_video"
        headingTag="headings.video"
        values={values}
    />);
};

export default VideoInfo;
