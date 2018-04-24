import React, { Fragment} from 'react';
import Icon from 'components/common/Icon';
import { renderInformationList } from 'containers/streamPage/utils';


const NetworkInfo = props => (
    <Fragment>
        <h2>
            <Icon value="settings ethernet" />
            <span>Network Information</span>
        </h2>
        <hr />
        {
            renderInformationList([
                {
                    key: 'Detected Stream',
                    value: 'ST2110'
                },
                {
                    key: 'Source',
                    value: `${props.source_address}:${props.source_port}`
                },
                {
                    key: 'Destination',
                    value: `${props.destination_address}:${props.destination_port}`
                },
                {
                    key: 'SSRC',
                    value: props.ssrc
                },
                {
                    key: 'Packets',
                    value: props.packet_count
                }
            ])
        }
    </Fragment>
);

export default NetworkInfo;
