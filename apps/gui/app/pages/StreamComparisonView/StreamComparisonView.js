import React from 'react';
import api from 'utils/api';
import asyncLoader from '../../components/asyncLoader';
import CompareStreamsView from './CompareStreamsView';
import ST2022_7_View from './ST2022_7_View';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';

const StreamComparisonView = props => {
    if (props.comparisonInfo.type == workflowTypes.compareStreams) {
        return <CompareStreamsView comparisonInfo={props.comparisonInfo} />;
    }
    else if (props.comparisonInfo.type == workflowTypes.st2022_7_analysis) {
        return <ST2022_7_View {...props.comparisonInfo} />;
    } else {
        return <div>Unknown comparison type ${props.type}</div>;
    }
};

export default asyncLoader(StreamComparisonView, {
    asyncRequests: {
        comparisonInfo: props => {
            const { comparisonID } = props.match.params;
            return api.getComparison(comparisonID);
        },
    },
});
