import React, { Fragment } from 'react';
import SectionHeader from 'components/common/SectionHeader';
import { renderInformationList } from 'containers/streamPage/utils';
import { translate } from 'utils/translation';

const AudioInfo = props => (
    <Fragment>
        <SectionHeader icon="audiotrack" label={translate('headings.audio')} />
        {renderInformationList([
            {
                key: translate('media_information.audio.encoding'),
                value: props.encoding
            },
            {
                key: translate('media_information.audio.number_channels'),
                value: `${props.number_channels}`
            },
            {
                key: translate('media_information.audio.sampling'),
                value: props.sampling
            },
            {
                key: translate('media_information.audio.packet_time'),
                value: props.packet_time
            }

        ])}
    </Fragment>
);

export default AudioInfo;
