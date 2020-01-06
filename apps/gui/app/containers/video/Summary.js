import React from 'react';
import NetworkInfo from '../streamPage/NetworkInfo';
import VideoInfo from '../streamPage/VideoInfo';
import AnalysisInfo from '../streamPage/AnalysisInfo';

const Summary = props => {
    const streamInfo = props.streamInfo;
    const statistics = streamInfo.statistics;
    const mediaInfo = streamInfo.media_specific;

    return (
        <div>
            <div className="row">
                <div className="col-xs-12 col-md-6">
                    <NetworkInfo stream={props.streamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <VideoInfo {...mediaInfo} {...statistics} />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <AnalysisInfo {...props} />
                </div>
            </div>
        </div>
    );
};

export default Summary;
