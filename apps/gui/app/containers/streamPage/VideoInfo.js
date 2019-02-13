import React, { Fragment } from 'react';
import Icon from 'components/common/Icon';
import { renderInformationList } from 'containers/streamPage/utils';
import { translate } from 'utils/translation';

const VideoInfo = (props) => {
    const size = `${props.width}x${props.height}`;

    const isInterlaced = props.scan_type === 'interlaced';

    return (
        <Fragment>
            <h2>
                <Icon value="ondemand video" />
                <span>{translate('headings.video')}</span>
            </h2>
            <hr />
            {renderInformationList([
                {
                    key: translate('media_information.video.dimensions'),
                    value: size
                },
                {
                    key: translate('media_information.video.sampling'),
                    value: props.sampling
                },
                {
                    key: isInterlaced ?
                        translate('media_information.video.field_rate') :
                        translate('media_information.video.frame_rate'),
                    value: props.rate
                },
                {
                    key: translate('media_information.video.scan_type'),
                    value: isInterlaced ?
                        translate('media_information.video.interlaced') :
                        translate('media_information.video.progressive')
                },
            ])}
        </Fragment>
    );
};

export default VideoInfo;
