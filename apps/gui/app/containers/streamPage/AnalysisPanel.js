import React from 'react';
import Dash21Info from './Dash21Info';
import RtpInfo from './RtpInfo';

const AnalysisPanel = (props) => {
    const streamInfo = props.streamInfo;
    const mediaInfo = streamInfo.media_specific;
    const globalVideoAnalysis = streamInfo.global_video_analysis;

    return (
        <div className="row">
            <div className="col-xs-12 col-md-6">
                <RtpInfo info={streamInfo} />
            </div>
            <div className="col-xs-12 col-md-6">
                <Dash21Info {...globalVideoAnalysis} {...mediaInfo} />
            </div>
        </div>
    );
};

export default AnalysisPanel;
