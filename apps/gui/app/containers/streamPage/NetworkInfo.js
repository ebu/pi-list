import React, { Fragment } from 'react';
import Icon from 'components/common/Icon';
import { renderInformationList } from 'containers/streamPage/utils';
import { translate } from 'utils/translation';

const NetworkInfo = props => (
    <Fragment>
        <h2>
            <Icon value="settings ethernet" />
            <span>{translate('headings.network_information')}</span>
        </h2>
        <hr />
        {
            renderInformationList([
                {
                    key: translate('stream.detected_stream'),
                    value: 'ST2110'
                },
                {
                    key: translate('media_information.rtp.source'),
                    value: `${props.source_address}:${props.source_port}`
                },
                {
                    key: translate('media_information.rtp.destination'),
                    value: `${props.destination_address}:${props.destination_port}`
                },
                {
                    key: translate('media_information.rtp.ssrc'),
                    value: props.ssrc
                },
                {
                    key: translate('media_information.rtp.packet_count'),
                    value: props.packet_count
                }
            ])
        }
    </Fragment>
);

export default NetworkInfo;
