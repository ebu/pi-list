import React from 'react';
import NetworkInfo from 'containers/streamPage/NetworkInfo';
import VideoInfo from 'containers/streamPage/VideoInfo';
import Dash21Info from 'containers/streamPage/Dash21Info';

const VideoStreamInformation = (props) => {
    const streamInfo = props.streamInfo;
    const networkInfo = streamInfo.network_information;
    const statistics = streamInfo.statistics;
    const mediaInfo = streamInfo.media_specific;
    const globalVideoAnalysis = streamInfo.global_video_analysis;

    return (
        <div className="row">
            <div className="col-xs-12 col-md-3">
                <NetworkInfo {...networkInfo}
                    packet_count={statistics.packet_count}
                    dropped_packet_count={statistics.dropped_packet_count}
                />
            </div>
            <div className="col-xs-12 col-md-3">
                <VideoInfo {...mediaInfo} {...statistics} />
            </div>
            <div className="col-xs-12 col-md-6">
                <Dash21Info {...globalVideoAnalysis} {...mediaInfo} />
            </div>
        </div>
    );
};

export default VideoStreamInformation;
