import React from 'react';
import _ from 'lodash';
import { T, translateX } from 'utils/translation';
import { useRouteMatch } from 'react-router-dom';
import InfoPane from './components/InfoPane';
import routeNames from '../../config/routeNames';

const getDscpInfo = props => {
    const dscp_consistent = _.get(props.stream, ['network_information', 'dscp', 'consistent'], undefined);

    if (dscp_consistent === undefined) {
        return translateX('headings.unknown');
    }

    if (dscp_consistent !== true) {
        return translateX('general.inconsistent');
    }

    const dscp_value = _.get(props.stream, ['network_information', 'dscp', 'value'], undefined);

    if (dscp_value === undefined) {
        return translateX('headings.unknown');
    }

    return dscp_value;
};

const NetworkInfo = props => {
    const { url } = useRouteMatch();

    const packet_count = _.get(props.stream, ['analyses', 'rtp_sequence', 'details', 'packet_count'], 0);
    const dropped_count = _.get(props.stream, ['analyses', 'rtp_sequence', 'details', 'dropped_packets_count'], 0);
    const dropped_samples = _.get(props.stream, ['analyses', 'rtp_sequence', 'details', 'dropped_packets_samples'], []);
    const invalidMulticastMacAddr =
        _.get(props.stream, ['analyses', 'destination_multicast_mac_address', 'result'], 'compliant') !== 'compliant';
    const invalidMulticastIpAddr =
        _.get(props.stream, ['analyses', 'destination_multicast_ip_address', 'result'], 'compliant') !== 'compliant';
    const invalidMulticastMapping =
        _.get(props.stream, ['analyses', 'unrelated_multicast_addresses', 'result'], 'compliant') !== 'compliant';

    const droppedPacketsUrl = `${url}/${routeNames.DROPPED_PACKETS}`;

    const droppedInfo =
        dropped_count == 0 ? (
            ''
        ) : (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <span style={{ marginLeft: '0.5rem' }}>(</span>
                <a
                    style={{ display: 'flex', flexDirection: 'row' }}
                    className="lst-stream-info-value-attention"
                    href={droppedPacketsUrl}
                    onClick={e => {
                        e.preventDefault();
                        window.appHistory.push({
                            pathname: droppedPacketsUrl,
                            state: { droppedPackets: dropped_samples },
                        });
                    }}
                >
                    <span style={{ marginRight: '0.5rem' }}>{dropped_count}</span>
                    <T t="media_information.rtp.dropped" />
                </a>
                <span>)</span>
            </div>
        );


    const values = [
        {
            labelTag: 'stream.detected_stream',
            value: 'ST2110',
        },
        {
            labelTag: 'media_information.rtp.source_mac',
            value: `${props.stream.network_information.source_mac_address}`.toUpperCase(),
        },
        {
            labelTag: 'media_information.rtp.destination_mac',
            value: `${props.stream.network_information.destination_mac_address}`.toUpperCase(),
            attention: invalidMulticastMacAddr || invalidMulticastMapping,
        },
        {
            labelTag: 'media_information.rtp.source',
            value: `${props.stream.network_information.source_address}:${props.stream.network_information.source_port}`,
        },
        {
            labelTag: 'media_information.rtp.destination',
            value: `${props.stream.network_information.destination_address}:${props.stream.network_information.destination_port}`,
            attention: invalidMulticastIpAddr,
        },
        {
            labelTag: 'media_information.rtp.payload_type',
            value: props.stream.network_information.payload_type,
        },
        {
            labelTag: 'media_information.rtp.ssrc',
            value: props.stream.network_information.ssrc,
        },
        {
            labelTag: 'media_information.rtp.has_extended_header',
            value: props.stream.network_information.has_extended_header ? translateX('feedback.yes') : translateX('feedback.no'),
        },
        {
            labelTag: 'media_information.rtp.packet_count',
            value: (
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <span>{packet_count}</span>
                    {droppedInfo}
                </div>
            ),
            attention: dropped_count != 0,
        },
        {
            label: 'DSCP',
            value: getDscpInfo(props),
        },
    ];

    return <InfoPane icon="settings_ethernet" headingTag="headings.network_information" values={values} />;
};

export default NetworkInfo;
