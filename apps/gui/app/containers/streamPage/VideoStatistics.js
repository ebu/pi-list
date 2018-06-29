import React, { Fragment } from 'react';
import Timecode from 'smpte-timecode';
import Icon from 'components/common/Icon';
import { renderInformationList } from 'containers/streamPage/utils';
import { translate } from 'utils/translation';

const VideoStatistics = (props) => {
    let timecode = '00:00:00:00';

    try {
        timecode = new Timecode(props.frame_count, Math.ceil(props.rate), false);
    } catch (e) {
        console.log(e);
    }

    return (
        <Fragment>
            <h2>
                <Icon value="photo size select large" />
                <span>{translate('headings.video_measurements')}</span>
            </h2>
            <hr />
            {renderInformationList([
                {
                    key: translate('media_information.media_time'),
                    value: timecode.toString()
                },
                {
                    key: props.is_interlaced ?
                        translate('media_information.video.fields') :
                        translate('media_information.video.frames'),
                    value: props.frame_count
                },
                {
                    key: props.is_interlaced ?
                        translate('media_information.video.field_rate') :
                        translate('media_information.video.frame_rate'),
                    value: props.rate.toFixed(2).toString() + ' Hz'
                },
                {
                    key: translate('media_information.video.packets_per_frame'),
                    value: props.packets_per_frame
                }
            ])}
        </Fragment>
    );
};

export default VideoStatistics;
