import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import {  } from './common';
import { Line, getBaseLayout, CHART_COLORS, graphHeight } from './common';

const Histogram = ({ x, y, title, xTitle, yTitle }) => {
    const layout = getBaseLayout();
    layout.xaxis.tickformat = ',d';
    layout.xaxis.title.text = xTitle;
    layout.yaxis.title.text = yTitle;

    const data = [];
    data.push(Line('value', x, y, CHART_COLORS.GREEN, false, 'bar'));

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

Histogram.propTypes = {
    x: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
    y: PropTypes.arrayOf(PropTypes.number).isRequired,
    title: PropTypes.string.isRequired,
    xTitle: PropTypes.string.isRequired,
    yTitle: PropTypes.string.isRequired,
};

Histogram.defaultProps = {};

export default Histogram;
