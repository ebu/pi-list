import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Plot from 'react-plotly.js';
import { Line, getBaseLayout, CHART_COLORS, graphHeight } from './common';

// layoutProperties
//    y axis integer:  { yaxis: { tickformat: ',d'}};
//    y axis 3 digits: { yaxis: { tickformat: ',.3f'}}
const Graph = ({
    x,
    y,
    value,
    min,
    max,
    mean,
    stddev,
    highLimit,
    highTolerance,
    title,
    xTitle,
    yTitle,
    layoutProperties,
}) => {
    const baseLayout = _.merge(getBaseLayout(), { xaxis: { tickformat: '%H:%M:%S.%L'}});
    const layout = _.merge(baseLayout, layoutProperties);
    layout.xaxis.title.text = xTitle;
    layout.yaxis.title.text = yTitle;
    layout.legend = {
        font: {
            color: '#000',
        },
        bgcolor: '#E2E2E2',
    };

    const data = [];
    data.push(Line('value', x, value, CHART_COLORS.GREEN, false, 'scatter'));
    data.push(Line('value', x, y, CHART_COLORS.GREEN, false, 'scatter'));
    data.push(Line('Min', x, min, CHART_COLORS.GREEN, false, 'scatter'));
    data.push(Line('Max', x, max, CHART_COLORS.RED, false, 'scatter'));
    data.push(Line('Mean', x, mean, CHART_COLORS.YELLOW, false, 'scatter'));
    data.push(Line('Std. Deviation', x, stddev, CHART_COLORS.BLUE, false, 'scatter'));
    data.push(Line('High limit', x, highLimit, CHART_COLORS.RED, true, 'scatter'));
    data.push(Line('High tolerance', x, highTolerance, CHART_COLORS.ORANGE, true, 'scatter'));

    return (
        <div className="lst-graph">
            <h1 className="lst-text-center">{title}</h1>
            <Plot
                className="app-plot"
                data={data}
                layout={layout}
                useResizeHandler
                config={{ scrollZoom: false, responsive: true }}
                style={{ height: graphHeight }}
            />
        </div>
    );
};

Graph.propTypes = {
    x: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    y: PropTypes.arrayOf(PropTypes.number),
    value: PropTypes.arrayOf(PropTypes.number),
    min: PropTypes.arrayOf(PropTypes.number),
    max: PropTypes.arrayOf(PropTypes.number),
    mean: PropTypes.arrayOf(PropTypes.number),
    stddev: PropTypes.arrayOf(PropTypes.number),
    highLimit: PropTypes.arrayOf(PropTypes.number),
    highTolerance: PropTypes.arrayOf(PropTypes.number),
    title: PropTypes.string.isRequired,
    xTitle: PropTypes.string.isRequired,
    yTitle: PropTypes.string.isRequired,
    layoutProperties: PropTypes.object,
};

Graph.defaultProps = {
    x: [],
    y: [],
    value: [],
    min: [],
    max: [],
    mean: [],
    stddev: [],
    highLimit: [],
    highTolerance: [],
    layoutProperties: {},
};

export default Graph;
