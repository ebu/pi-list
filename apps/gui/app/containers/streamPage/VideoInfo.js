import React, { Fragment } from 'react';
import Icon from 'components/common/Icon';
import { renderInformationList } from 'containers/streamPage/utils';

const VideoInfo = (props) => {

    const size = `${props.width}x${props.height}`;

    const isInterlaced = props.scan_type === 'interlaced';

    return (
        <Fragment>
            <h2>
                <Icon value="ondemand video" />
                <span>Video</span>
            </h2>
            <hr />
            {renderInformationList([
                {
                    key: 'Dimensions',
                    value: size
                },
                {
                    key: 'Sampling',
                    value: props.sampling
                },
                {
                    key: isInterlaced ? 'Field Rate' : 'Frame Rate',
                    value: props.rate
                },
                {
                    key: 'Scan Mode',
                    value: isInterlaced ? 'Interlaced' : 'Progressive'
                },
            ])}
        </Fragment>
    );
};

export default VideoInfo;
