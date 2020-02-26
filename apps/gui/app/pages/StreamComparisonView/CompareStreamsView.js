import React from 'react';
import ComparisonConfigPane from './Config';
import PsnrAndDelayPane from '../../containers/comparisons/PsnrAndDelay';
import CrossCorrelationPane from '../../containers/comparisons/CrossCorrelation';
import Button from '../../components/common/Button';

const CompareStreamsView = (props) => {
    return (
        <div>
            <div className="row">
                <div className="col-xs-12 col-md-4">
                    <ComparisonConfigPane {... props.comparisonInfo.config} />
                </div>
                <div className="col-xs-12 col-md-6">
                    {
                        props.comparisonInfo.config.comparison_type === 'psnrAndDelay'?
                        <PsnrAndDelayPane { ... props.comparisonInfo } /> :
                            props.comparisonInfo.config.comparison_type === 'crossCorrelation'?
                            <CrossCorrelationPane { ... props.comparisonInfo } /> : ''
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
};

export default CompareStreamsView;
