import React, { Fragment } from 'react';
import _ from 'lodash';
import { translateX } from 'utils/translation';
import InfoPane from './components/InfoPane';

const NetworkInfo = props => {
    const packet_count = _.get(props.stream, ['analyses', 'rtp_sequence', 'details', 'packet_count'], 0);
    const dropped_count = _.get(props.stream, ['analyses', 'rtp_sequence', 'details', 'dropped_packets'], 0);
    const invalidMulticastMacAddr = _.get(props.stream, ['analyses', 'destination_multicast_mac_address', 'result'], 'compliant') !== 'compliant';
    const invalidMulticastIpAddr = _.get(props.stream, ['analyses', 'destination_multicast_ip_address', 'result'], 'compliant') !== 'compliant';
    const invalidMulticastMapping = _.get(props.stream, ['analyses', 'unrelated_multicast_addresses', 'result'], 'compliant') !== 'compliant';
    const droppedInfo = dropped_count == 0 ? '' : ` (${dropped_count} ${translateX('media_information.rtp.dropped')})`;

    const values = [
        {
            labelTag: 'stream.detected_stream',
            value: 'ST2110'
        },
        {
            labelTag: 'media_information.rtp.source_mac',
            value: `${props.stream.network_information.source_mac_address}`.toUpperCase()
        },
        {
            labelTag: 'media_information.rtp.destination_mac',
            value: `${props.stream.network_information.destination_mac_address}`.toUpperCase(),
            attention: invalidMulticastMacAddr || invalidMulticastMapping
        },
        {
            labelTag: 'media_information.rtp.source',
            value: `${props.stream.network_information.source_address}:${props.stream.network_information.source_port}`
        },
        {
            labelTag: 'media_information.rtp.destination',
            value: `${props.stream.network_information.destination_address}:${props.stream.network_information.destination_port}`,
            attention: invalidMulticastIpAddr
        },
        {
            labelTag: 'media_information.rtp.ssrc',
            value: props.stream.network_information.ssrc
        },
        {
            labelTag: 'media_information.rtp.packet_count',
            value: `${packet_count}${droppedInfo}`,
            attention: dropped_count != 0
        }
    ];

    return (<InfoPane
        icon="settings_ethernet"
        headingTag="headings.network_information"
        values={values}
    />);
};

export default NetworkInfo;
