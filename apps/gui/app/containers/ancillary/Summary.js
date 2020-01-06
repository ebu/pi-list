import React from 'react';
import NetworkInfo from '../streamPage/NetworkInfo';
import VideoInfo from '../streamPage/VideoInfo';
import AnalysisInfo from '../streamPage/AnalysisInfo';

const Summary = props => {
    const streamInfo = props.streamInfo;

    return (
        <div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <NetworkInfo stream={props.streamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <VideoInfo {...streamInfo.media_type} {...streamInfo.media_specific} {...streamInfo.statistics} />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <AnalysisInfo {...props} />
                </div>
            </div>
        </div>
    );
};

export default Summary;
