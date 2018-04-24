import { CHART_COLORS } from 'components/Chart';

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
            color: CHART_COLORS.GREEN
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

export default {
    cinstHistogramValues,
    cinstHistogramCounts,
    singleValueChart,
    minMaxChart,
    getTimeLineLabel,
    stdDeviationMeanMinMaxChart
}