import React, { Fragment } from 'react';
import SectionHeader from 'components/common/SectionHeader';
import { renderInformationList } from './utils';

const AudioStatistics = props => (
    <Fragment>
        <SectionHeader icon="queue music" label="Audio Measurements" />
        {renderInformationList([
            {
                key: 'Number of Samples',
                value: props.sample_count
            },
            {
                key: 'Size of each sample',
                value: `${props.sample_size} bytes`
            },
            {
                key: 'Number of samples per RTP packet',
                value: props.samples_per_packet
            }
        ])}
    </Fragment>
);

export default AudioStatistics;
