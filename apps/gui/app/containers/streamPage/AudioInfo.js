import React, { Fragment } from 'react';
import SectionHeader from 'components/common/SectionHeader';
import { renderInformationList } from 'containers/streamPage/utils';

const AudioInfo = props => (
    <Fragment>
        <SectionHeader icon="audiotrack" label="Audio" />
        {renderInformationList([
            {
                key: 'Encoding',
                value: props.encoding
            },
            {
                key: 'Number of Channels',
                value: `${props.number_channels}`
            },
            {
                key: 'Sampling',
                value: props.sampling
            }
        ])}
    </Fragment>
);

export default AudioInfo;
