import React, { Component } from 'react';
import { isNumber, isFunction } from 'lodash';
import ChartJS from 'chart.js';
import asyncLoader from 'components/asyncLoader';

class Chart extends Component {
    prepareChart() {
        const labels = isFunction(this.props.labels)
            ? this.props.labels(this.props.rawData)
            : this.props.labels;
        let datasets = isFunction(this.props.formatData)
            ? this.props.formatData(this.props.rawData)
            : this.props.datasets;

        datasets = datasets.map(dataset => ({
            label: dataset.label,
            borderColor: dataset.color,
            backgroundColor: dataset.backgroundColor,
            fill: false,
            data: dataset.data,
            lineTension: 0.25,
        }));

        const config = {
            type: this.props.type,
            data: {
                labels,
                datasets,
            },
            showTooltips: false,
            options: {
                animation: {
                    onComplete: this.props.onAnimationComplete,
                    duration: 2,
                },
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: this.props.title,
                    [this.props.colorScheme === 'dark' &&
                    'fontColor']: '#D8DEE9',
                },
                elements: {
                    point: {
                        radius: this.props.point_radius
                            ? this.props.point_radius
                            : 1,
                    },
                },
                scales: {
                    yAxes: [
                        {
                            gridLines: {
                                display: true,
                                [this.props.colorScheme === 'dark' &&
                                'fontColor']: '#D8DEE9',
                            },
                            scaleLabel: {
                                display: this.props.yLabel != null,
                                labelString: this.props.yLabel,
                                [this.props.colorScheme === 'dark' &&
                                'fontColor']: '#D8DEE9',
                            },
                            ticks: {
                                [this.props.colorScheme === 'dark' &&
                                'fontColor']: '#D8DEE9',
                            },
                        },
                    ],
                    xAxes: [
                        {
                            gridLines: {
                                display: false,
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: this.props.xLabel,
                            },
                            ticks: {
                                display: this.props.displayXTicks != null,
                                [this.props.colorScheme === 'dark' &&
                                'fontColor']: '#D8DEE9',
                            },
                        },
                    ],
                },
                legend: {
                    display: this.props.legend != null,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                    },
                },
                zoom: {
                    enabled: true,
                    drag: true,
                },
            },
        };

        if (this.props.ticksMin) {
            const current = config.options.scales.yAxes[0].ticks || {};
            current.min = this.props.ticksMin;
            config.options.scales.yAxes[0].ticks = current;
        }

        if (this.props.ticksMax) {
            const current = config.options.scales.yAxes[0].ticks || {};
            current.max = this.props.ticksMax;
            config.options.scales.yAxes[0].ticks = current;
        }

        return config;
    }

    componentDidMount() {
        const config = this.prepareChart();
        const ctx = this.chart.getContext('2d');
        this.chartInstance = new ChartJS(ctx, config);
    }

    componentWillUnmount() {
        this.chartInstance.destroy();
    }

    render() {
        if (this.chartInstance !== undefined) {
            const config = this.prepareChart();
            this.chartInstance.data = config.data;
            this.chartInstance.options = config.options;

            this.chartInstance.update();
        }

        const style = {
            height: isNumber(this.props.height)
                ? `${this.props.height}px`
                : null,
        };

        return (
            <div style={style}>
                <canvas
                    className={`lst-chart-${Date.now()} fade-in`}
                    ref={ref => (this.chart = ref)}
                />
            </div>
        );
    }
}

export default asyncLoader(Chart, {
    asyncRequests: {
        rawData: props => props.request(),
    },
});
