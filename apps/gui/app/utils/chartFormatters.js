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

const xAxisTimeDomain = point => point.time;
const xAxisLinearDomain = point => point.index;

function getTimeLineLabel(chartData) {
    return chartData.map(data => data.time);
}

function histogramValues(chartData) {
    const value = [];

    chartData.histogram.forEach((v) => {
        value.push(v[0]);
    });

    return value;
}

function histogramCounts(chartData) {
    const value = [];

    chartData.histogram.forEach((v) => {
        value.push(v[1]);
    });

    return [
        {
            label: 'Count',
            backgroundColor: CHART_COLORS.GREEN,
            borderColor: CHART_COLORS.GREEN,
            data: value,
            color: CHART_COLORS.GREEN,
        },
    ];
}

function singleValueChart(chartData) {
    const value = [];

    chartData.forEach((v) => {
        value.push(v.value);
    });

    return [
        {
            label: 'Value',
            data: value,
            color: CHART_COLORS.GREEN,
            backgroundColor: CHART_COLORS.GREEN,
        },
    ];
}

export default {
    histogramValues,
    histogramCounts,
    singleValueChart,
    xAxisTimeDomain,
    xAxisLinearDomain,
};
