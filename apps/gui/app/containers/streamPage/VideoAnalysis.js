import React from 'react';
import Dash21Info from './Dash21Info';
import RtpInfo from './RtpInfo';
import Button from '../../components/common/Button';
import AnalysisInfo from './AnalysisInfo';

const VideoAnalysis = (props) => {
    return (
        <div>
            <div className="row">
                <div className="col-xs-12 col-md-6">
                    <Dash21Info info={props.streamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <RtpInfo info={props.streamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <AnalysisInfo {...props} />
                </div>
            </div>
            <hr />
            <Button
                    type="info"
                    label="Video analysis explained"
                    onClick={() => {
                        window.open(
                            'https://github.com/ebu/pi-list/blob/master/docs/video_timing_analysis.md',
                            '_blank'
                        );
                    }}
                />
        </div>
    );
};

export default VideoAnalysis;
