import React, { Fragment } from 'react';
import { translate } from 'utils/translation';
import InfoPane from './components/InfoPane';

const NetworkInfo = props => {
    const dropped_count = props.dropped_packet_count || 0;
    const droppedInfo = dropped_count == 0 ? '' : ` (${dropped_count} ${translate('media_information.rtp.dropped')})`;

    const values = [
        {
            labelTag: 'stream.detected_stream',
            value: 'ST2110'
        },
        {
            labelTag: 'media_information.rtp.source',
            value: `${props.source_address}:${props.source_port}`
        },
        {
            labelTag: 'media_information.rtp.destination',
            value: `${props.destination_address}:${props.destination_port}`
        },
        {
            labelTag: 'media_information.rtp.ssrc',
            value: props.ssrc
        },
        {
            labelTag: 'media_information.rtp.packet_count',
            value: `${props.packet_count}${droppedInfo}`
        }
    ];

    return (<InfoPane
        icon="settings_ethernet"
        headingTag="headings.network_information"
        values={values}
    />);
};

export default NetworkInfo;
