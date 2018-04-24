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
                <span>Video Measurements</span>
            </h2>
            <hr />
            {renderInformationList([
                {
                    key: 'Media Time',
                    value: timecode.toString()
                },
                {
                    key: props.is_interlaced ? 'Fields' : 'Frames',
                    value: props.frame_count
                },
                {
                    key: props.is_interlaced ? 'Field Rate' : 'Frame Rate',
                    value: props.rate.toFixed(2).toString() + " Hz"
                },
                {
                    key: translate('packets_per_frame'),
                    value: props.packets_per_frame
                }
            ])}
        </Fragment>
    );
};

export default VideoStatistics;
