import React, { Fragment } from 'react';
import SectionHeader from 'components/common/SectionHeader';
import { translate } from 'utils/translation';
import { renderInformationList } from './utils';

const AudioStatistics = props => (
    <Fragment>
        <SectionHeader icon="queue music" label={translate('headings.audio_measurements')} />
        {renderInformationList([
            {
                key: translate('media_information.audio.number_samples'),
                value: props.sample_count
            },
            {
                key: translate('media_information.audio.sample_size'),
                value: `${props.sample_size} bytes`
            },
            {
                key: translate('media_information.audio.samples_per_packet'),
                value: props.samples_per_packet
            },
            {
                key: translate('media_information.audio.tsdf_max'),
                value: `${props.tsdf_max} usec`
            }

        ])}
    </Fragment>
);

export default AudioStatistics;
