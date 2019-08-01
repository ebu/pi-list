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

const highThersholdsLineChart = [
    {
        yValues: 'high-limit',
        label: 'High Limit',
        type: 'dashed',
        color: CHART_COLORS.DARK_RED,
    },
    {
        yValues: 'high-tolerance',
        label: 'High Tolerance',
        type: 'dashed',
        color: CHART_COLORS.ORANGE,
    },
];

const lowThersholdsLineChart = [
    {
        yValues: 'low-tolerance',
        label: 'Low Tolerance',
        type: 'dashed',
        color: CHART_COLORS.CYAN,
    },
    {
        yValues: 'low-limit',
        label: 'Low Limit',
        type: 'dashed',
        color: CHART_COLORS.DARK_BLUE,
    },
];

const statsLineChart = [
    {
        yValues: 'max',
        label: 'Max',
        color: CHART_COLORS.RED,
    },
    {
        yValues: 'mean',
        label: 'Mean',
        color: CHART_COLORS.YELLOW,
    },
    {
        yValues: 'min',
        label: 'Min',
        color: CHART_COLORS.GREEN,
    },
    {
        yValues: 'stddev',
        label: 'Std. Deviation',
        color: CHART_COLORS.BLUE,
    },
];

const singleValueLineChart = [
    {
        yValues: 'value',
        label: 'Value',
        color: CHART_COLORS.GREEN,
    },
];

const xAxisTimeDomain = point => point.time;

function getTimeLineLabel(chartData) {
    return chartData.map(data => data.time);
}

function cinstHistogramValues(chartData) {
    const value = [];

    chartData['histogram'].forEach(v => {
        value.push(v[0]);
    });

    return value;
}

function cinstHistogramCounts(chartData) {
    const value = [];

    chartData['histogram'].forEach(v => {
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

    chartData.forEach(v => {
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

function minMaxChart(chartData) {
    const min = [];
    const max = [];

    chartData.forEach(value => {
        min.push(value.min);
        max.push(value.max);
    });

    return [
        {
            label: 'Max',
            data: max,
            color: CHART_COLORS.GREEN,
        },
        {
            label: 'Min',
            data: min,
            color: CHART_COLORS.YELLOW,
        },
    ];
}

function stdDeviationMeanMinMaxChart(chartData) {
    const stddev = [];
    const mean = [];
    const min = [];
    const max = [];

    chartData.forEach(value => {
        stddev.push(value.stddev);
        mean.push(value.mean);
        min.push(value.min);
        max.push(value.max);
    });

    return statsLineChart;
}

export default {
    cinstHistogramValues,
    cinstHistogramCounts,
    singleValueChart,
    minMaxChart,
    getTimeLineLabel,
    stdDeviationMeanMinMaxChart,

    // new Line Chart API
    statsLineChart,
    highThersholdsLineChart,
    lowThersholdsLineChart,
    singleValueLineChart,
    xAxisTimeDomain,
};
