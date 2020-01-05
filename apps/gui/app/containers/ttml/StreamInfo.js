import React from 'react';
import PropTypes from 'prop-types';
import NetworkInfo from '../streamPage/NetworkInfo';
import TTMLSummary from './TTMLSummary';
import AnalysisInfo from '../streamPage/AnalysisInfo';

const StreamInfo = props => {
    return (
        <div>
            <div className="row lst-full-height">
                <div className="col-xs-12">
                    <div className="row">
                        <div className="col-xs-12 col-md-6">
                            <NetworkInfo stream={props.streamInfo} />
                        </div>
                        <div className="col-xs-12 col-md-6">
                            <TTMLSummary {...props} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-md-6">
                            <AnalysisInfo {...props} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

StreamInfo.propTypes = {
    streamInfo: PropTypes.object.isRequired,
};

StreamInfo.defaultProps = {};

export default StreamInfo;
