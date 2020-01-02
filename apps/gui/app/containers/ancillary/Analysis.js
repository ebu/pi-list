import React from 'react';
import AnalysisInfo from '../streamPage/AnalysisInfo';
import RtpInfo from './RtpInfo';
import AncillarySummary from './AncillarySummary';

const Analysis = props => {
    const streamInfo = props.streamInfo;

    return (
        <div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <RtpInfo {...props} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <AncillarySummary {...props} />
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

export default Analysis;
