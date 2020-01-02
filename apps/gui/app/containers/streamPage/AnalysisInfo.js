import React from 'react';
import _ from 'lodash';
import { translateX } from 'utils/translation';

import analysisConstants from '../../enums/analysis';
import AnalysisBadge from '../../components/stream/StreamCard/AnalysisBadge';

const AnalysisInfo = props => {
    const analyses = _.get(props.streamInfo, 'analyses', []);
    const badges = Object.keys(analyses)
        .sort()
        .map(analysis => {
            const compliance = analyses[analysis].result;
            const name = analysisConstants.analysesNames[analysis];
            return <AnalysisBadge key={analysis} name={name} compliance={compliance} />;
        });

    return (
        <div>
            <div className="lst-stream-info-header">
                <i className="material-icons lst-stream-info-header-icon">list</i>
                <span className="lst-stream-info-header-label">{translateX('media_information.analysis')}</span>
            </div>
            <hr />
            <div className="col-xs-12 col-md-12">{badges}</div>
        </div>
    );
};

export default AnalysisInfo;
