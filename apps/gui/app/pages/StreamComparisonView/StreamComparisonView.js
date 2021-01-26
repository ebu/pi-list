import React from 'react';
import api from 'utils/api';
import asyncLoader from '../../components/asyncLoader';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';
import ComparisonConfigPane from './Config';
import PsnrAndDelayPane from '../../containers/comparisons/PsnrAndDelay';
import CrossCorrelationPane from '../../containers/comparisons/CrossCorrelation';
import AVSync from '../../containers/comparisons/AVSync';
import Button from '../../components/common/Button';
import ST2022_7_View from './ST2022_7_View';

const StreamComparisonView = props => {
    const comp = props.comparisonInfo;

    if ((comp.type == workflowTypes.compareStreams) ||
        (comp.type == workflowTypes.st2022_7_analysis)) {
        return (
            <div>
                <div className="row">
                    <div className="col-xs-12 col-md-4">
                        <ComparisonConfigPane {...comp.config} type={comp.type} />
                    </div>
                    <div className="col-xs-12 col-md-6">
                        {
                            comp.type === workflowTypes.st2022_7_analysis?
                                <ST2022_7_View {...props.comparisonInfo} /> :
                                    comp.config.comparison_type === 'psnrAndDelay'?
                                    <PsnrAndDelayPane {...props.comparisonInfo} /> :
                                        comp.config.comparison_type === 'crossCorrelation'?
                                        <CrossCorrelationPane {...props.comparisonInfo} /> :
                                            comp.config.comparison_type === 'AVSync'?
                                                <AVSync {...props.comparisonInfo} /> : ''
                        }
                    </div>
                </div>
                <hr/>
                <Button
                    type="info"
                    label="Stream comparison explained"
                    onClick={() => {
                        window.open('https://github.com/ebu/pi-list/blob/master/docs/stream_compare.md', '_blank');
                    }}
                />
            </div>
        );
    } else {
        return <div>Unknown comparison type ${comp.type}</div>;
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
