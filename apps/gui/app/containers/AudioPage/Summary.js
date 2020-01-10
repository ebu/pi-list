import React from 'react';
import NetworkInfo from '../streamPage/NetworkInfo';
import AudioInfo from '../streamPage/AudioInfo';
import AnalysisInfo from '../streamPage/AnalysisInfo';

const Summary = props => {
    const streamInfo = props.streamInfo;
    const statistics = streamInfo.statistics;

    return (
        <div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <NetworkInfo stream={props.streamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <AudioInfo {...props.streamInfo.media_specific} {...statistics} />
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
