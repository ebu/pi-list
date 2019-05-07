import React from 'react';
import NetworkInfo from './NetworkInfo';
import VideoInfo from './VideoInfo';
import Dash21Info from './Dash21Info';
import RtpInfo from './RtpInfo';

const VideoStreamInformation = (props) => {
    const streamInfo = props.streamInfo;
    const statistics = streamInfo.statistics;
    const mediaInfo = streamInfo.media_specific;

    return (
        <div className="row">
            <div className="col-xs-12 col-md-6">
                <NetworkInfo stream={props.streamInfo} />
            </div>
            <div className="col-xs-12 col-md-6">
                <VideoInfo {...mediaInfo} {...statistics} />
            </div>
        </div>
    );
};

export default VideoStreamInformation;
