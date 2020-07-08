import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';

export const CHART_COLORS = {
    RED: '#C00000',
    DARK_RED: '#30000',
    ORANGE: '#FFB000',
    YELLOW: '#ECB857',
    GREEN: '#4CAF4F',
    CYAN: '#00E0E0',
    BLUE: '#5086D8',
    DARK_BLUE: '#000080',
};
const transparent = 'rgba(0,0,0,0)';
const gridColor = '#ffffff30';
const graphHeight = '600px';
const lineWidth = 3;

const axisFont = {
    family: 'Roboto',
    weight: 100,
    size: 24,
    color: '#ffffff',
};

const titleProps = {
    font: axisFont,
};

const tickProps = {
    // tickangle : -45,
    tickfont: {
        family: 'Roboto',
        weight: 100,
        size: 16,
        color: '#ffffff',
    },
};

const commonAxis = {
    automargin: true,
    gridcolor: gridColor,
    gridwidth: 1,
};

const xaxis = {
    ...commonAxis,
    title: {
        ...titleProps,
    },
    ...titleProps,
    ...tickProps,
};

const yaxis = {
    ...commonAxis,
    title: {
        ...titleProps,
    },
    ...tickProps,
    tickformat: '+20',
    showgrid: true,
};

const Line = (name, x, y, color, dashed) => {
    const line = {
        color: color,
        width: lineWidth,
        dash: dashed ? 'dash' : '',
    };
    const mode = dashed ? 'lines' : 'lines+markers';

    return y.length > 0
        ? {
              name: name,
              x: x,
              y: y,
              type: 'scatter',
              marker: { color: color },
              mode: mode,
              line: line,
          }
        : {};
};

const Graph = ({ x, y, min, max, mean, stddev, highLimit, highTolerance, title, xTitle, yTitle }) => {
    const layout = {
        autosize: true,
        xaxis: { ...xaxis },
        yaxis: { ...yaxis },
        margin: {},
        paper_bgcolor: transparent,
        plot_bgcolor: transparent,
    };
    layout.xaxis.title.text = xTitle;
    layout.yaxis.title.text = yTitle;

    const data = [];
    data.push(Line('value', x, y, CHART_COLORS.GREEN, false));
    data.push(Line('Min', x, min, CHART_COLORS.GREEN, false));
    data.push(Line('Max', x, max, CHART_COLORS.RED, false));
    data.push(Line('Mean', x, mean, CHART_COLORS.YELLOW, false));
    data.push(Line('Std. Deviation', x, stddev, CHART_COLORS.BLUE, false));
    data.push(Line('High limit', x, highLimit, CHART_COLORS.RED, true));
    data.push(Line('High tolerance', x, highTolerance, CHART_COLORS.ORANGE, true));

    return (
        <div className="lst-graph">
            <h1 className="lst-text-center">{title}</h1>
            <Plot
                className="app-plot"
                data={data}
                layout={layout}
                useResizeHandler
                config={{ scrollZoom: true, responsive: true }}
                style={{ height: graphHeight }}
            />
        </div>
    );
};

Graph.propTypes = {
    x: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    y: PropTypes.arrayOf(PropTypes.number),
    min: PropTypes.arrayOf(PropTypes.number),
    max: PropTypes.arrayOf(PropTypes.number),
    mean: PropTypes.arrayOf(PropTypes.number),
    stddev: PropTypes.arrayOf(PropTypes.number),
    highLimit: PropTypes.arrayOf(PropTypes.number),
    highTolerance: PropTypes.arrayOf(PropTypes.number),
    title: PropTypes.string.isRequired,
    xTitle: PropTypes.string.isRequired,
    yTitle: PropTypes.string.isRequired,
};

Graph.defaultProps = {
    x: [],
    y: [],
    min: [],
    max: [],
    mean: [],
    stddev: [],
    highLimit: [],
    highTolerance: [],
};

export default Graph;
