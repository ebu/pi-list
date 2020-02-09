import React, { Component } from 'react';
import api from 'utils/api';
import { translateX } from '../utils/translation';
import asyncLoader from '../components/asyncLoader';
import errorEnum from '../enums/errorEnum';
import ErrorPage from '../components/ErrorPage';
import routeBuilder from '../utils/routeBuilder';
import ComparisonConfigPane from '../containers/comparisons/Config';
import PsnrAndDelayPane from '../containers/comparisons/PsnrAndDelay';
import CrossCorrelationPane from '../containers/comparisons/CrossCorrelation';
import Button from '../components/common/Button';


const StreamComparisonPage = (props) => {
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

export default asyncLoader(StreamComparisonPage, {
    asyncRequests: {
        comparisonInfo: (props) => {
            const { comparisonID } = props.match.params;
            return api.getComparison(comparisonID);
        },
    },
});
