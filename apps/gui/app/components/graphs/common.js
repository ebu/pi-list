const transparent = 'rgba(0,0,0,0)';
const gridColor = '#ffffff30';
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
    tickformat: ',d',
};

const yaxis = {
    ...commonAxis,
    title: {
        ...titleProps,
    },
    ...tickProps,
    showgrid: true,
};

export const Line = (name, x, y, color, dashed, type) => {
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
              type: type,
              marker: { color: color },
              mode: mode,
              line: line,
          }
        : {};
};

const baseLayoutX = {
    autosize: true,
    xaxis: { ...xaxis },
    yaxis: { ...yaxis },
    margin: {},
    paper_bgcolor: transparent,
    plot_bgcolor: transparent,
};

export const getBaseLayout = () => {
    return _.cloneDeep(baseLayoutX);
};

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

export const graphHeight = '600px';
