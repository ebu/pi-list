import React from 'react';
import ComparisonsList from '../containers/comparisons/ComparisonsList';
import StreamComparisonPanel from '../containers/comparisons/StreamComparisonPanel';

const ComparisonsPage = props => (
    <div className="row">
        <div className="col-xs-12">
            <StreamComparisonPanel />
            <ComparisonsList />
        </div>
    </div>
);

export default ComparisonsPage;
