import React, { Component } from 'react';
import api from '../utils/api';
import asyncLoader from './asyncLoader';

const ComparisonNameHeader = props => (
    <div className="lst-header-item fade-in">{props.comparison.name}</div>
);

export default asyncLoader(ComparisonNameHeader, {
    loaderProps: {
        loadingWidget: <div className="lst-header-item fade-in" />,
    },
    asyncRequests: {
        comparison: (props) => {
            const { comparisonID } = props.match.params;
            return api.getComparison(comparisonID);
        },
    },
});
