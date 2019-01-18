export const CHART_COLORS = {
    BLUE: '#5086d8',
    YELLOW: '#ecb857',
    GREEN: '#4caf4f',
    RED: '#d25b49'
};

export const DARK_CHART_COLORS = {
    BLUE: '#5E81AC',
    YELLOW: '#EBCB8B',
    GREEN: '#A3BE8C',
    RED: '#BF616A'
};

function getTimeLineLabel(chartData) {
    return chartData.map(data => data.time);
}

function cinstHistogramValues(chartData) {
    const value = [];

    chartData['histogram'].forEach((v) => {
        value.push(v[0]);
    });

    return value;
}

function cinstHistogramCounts(chartData) {
    const value = [];

    chartData['histogram'].forEach((v) => {
        value.push(v[1]);
    });

    return [
        {
            label: 'Count',
            backgroundColor: CHART_COLORS.GREEN,
            borderColor: CHART_COLORS.GREEN,
            data: value,
            color: CHART_COLORS.GREEN
        }
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
            backgroundColor: CHART_COLORS.GREEN
        }
    ];
}

function minMaxChart(chartData) {
    const min = [];
    const max = [];

    chartData.forEach((value) => {
        min.push(value.min);
        max.push(value.max);
    });

    return [
        {
            label: 'Max',
            data: max,
            color: CHART_COLORS.GREEN
        },
        {
            label: 'Min',
            data: min,
            color: CHART_COLORS.YELLOW
        }
    ];
}

function stdDeviationMeanMinMaxChart(chartData) {
    const stddev = [];
    const mean = [];
    const min = [];
    const max = [];

    chartData.forEach((value) => {
        stddev.push(value.stddev);
        mean.push(value.mean);
        min.push(value.min);
        max.push(value.max);
    });

    return [
        {
            label: 'Std. Deviation',
            data: stddev,
            color: CHART_COLORS.BLUE
        },
        {
            label: 'Mean',
            data: mean,
            color: CHART_COLORS.YELLOW
        },
        {
            label: 'Max',
            data: max,
            color: CHART_COLORS.GREEN
        },
        {
            label: 'Min',
            data: min,
            color: CHART_COLORS.RED
        },
    ];
}


const minMaxLineChart = [
    {
        yValues: "max",
        label: "Max",
        color: CHART_COLORS.GREEN
    },
    {
        yValues: "min",
        label: "Min",
        color: CHART_COLORS.YELLOW
    }
];

const stdDeviationMeanMinMaxLineChart = [
    {
        yValues: "stddev",
        label: "Std. Deviation",
        color: CHART_COLORS.BLUE
    },
    {
        yValues: "mean",
        label: "Mean",
        color: CHART_COLORS.YELLOW
    },
    {
        yValues: "max",
        label: "Max",
        color: CHART_COLORS.GREEN
    },
    {
        yValues: "min",
        label: "Min",
        color: CHART_COLORS.RED
    }
];

const singleValueLineThresholdChart = [
    {
        yValues: "value",
        label: "Value",
        color: CHART_COLORS.GREEN
    },
    {
        yValues: "tolerance",
        label: "Tolerance",
        color: CHART_COLORS.YELLOW
    },
    {
        yValues: "limit",
        label: "Limit",
        color: CHART_COLORS.RED
    }

];

const singleValueLineChart = [
    {
        yValues: "value",
        label: "Value",
        color: CHART_COLORS.GREEN
    }
];

const xAxisTimeDomain = (point) => point.time;

export default {
    cinstHistogramValues,
    cinstHistogramCounts,
    singleValueChart,
    minMaxChart,
    getTimeLineLabel,
    stdDeviationMeanMinMaxChart,

    // new Line Chart API
    minMaxLineChart,
    stdDeviationMeanMinMaxLineChart,
    singleValueLineThresholdChart,
    singleValueLineChart,
    xAxisTimeDomain
};
