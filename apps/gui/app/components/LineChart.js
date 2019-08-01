import React, { Component, Fragment } from 'react';
import { isString, isObject, pick, omit } from 'lodash';
import * as d3 from 'd3';
import classnames from 'classnames';
import asyncLoader from 'components/asyncLoader';
import Button from 'components/common/Button';

const defaultProps = {
    yAxisTick: 7,
};

class LineChart extends Component {
    constructor(props) {
        super(props);

        const data = this.props.rawData.map(item => ({
            ...item,
            timestamp: new Date(item.time),
        }));

        this.margin = { top: 20, right: 10, bottom: 30, left: 65 };

        this.lines = [];

        this.state = {
            width: 100,
            chartHeight:
                this.props.height - this.margin.top - this.margin.bottom,
            chartWidth: 100,
            dataKeys: this.props.data.map(item => item.yValues),
            hiddenOptions: [],
            data,
        };

        this.graphID = `${Math.random()
            .toString(36)
            .substr(2, 9)}_${Date.now()}`;

        this._onZoom = this._onZoom.bind(this);
        this._getMinY = this._getMinY.bind(this);
        this._getMaxY = this._getMaxY.bind(this);
        this._onClickToggleVisibility = this._onClickToggleVisibility.bind(
            this
        );
    }

    componentDidMount() {
        const width = this.chartContainer.offsetWidth;

        let legendWidth = 0;

        if (isObject(this.chartLegend)) {
            legendWidth = this.chartLegend.offsetWidth;
        }

        this.setState(
            {
                width,
                chartWidth:
                    width - this.margin.left - this.margin.right - legendWidth,
            },
            this._initializeChart
        );
    }

    _onZoom() {
        const { transform } = d3.event;

        this.xScale.domain(
            transform.rescaleX(this.densityChartXScale).domain()
        );

        this.graphAreaD3.select('.x-axis').call(this.xAxis);

        const lines = this.lines;

        this.graphAreaD3.selectAll('.line-chart').each(function(data, index) {
            d3.select(this).attr('d', lines[index]);
        });
    }

    _onClickToggleVisibility(key) {
        const isHidden = this.state.hiddenOptions.includes(key);
        let hiddenOptions = [...this.state.hiddenOptions];

        if (isHidden) {
            hiddenOptions = hiddenOptions.filter(option => option !== key);
        } else {
            hiddenOptions = [...hiddenOptions, key];
        }

        this.graphAreaD3.select(`#${key}`).style('opacity', isHidden ? 1 : 0);

        this.setState({ hiddenOptions }, this._updateChart);
    }

    render() {
        return (
            <Fragment>
                {this._renderTitle(this.props.title)}
                <div
                    className="lst-css-line-chart"
                    ref={ref => (this.chartContainer = ref)}
                >
                    <svg height={this.props.height} width={this.state.width}>
                        <defs>
                            <clipPath id={this.graphID}>
                                <rect
                                    height={this.props.height}
                                    width={this.state.chartWidth}
                                />
                            </clipPath>
                        </defs>
                        <g
                            ref={ref => (this.graphArea = ref)}
                            className="lst-svg-line-chart-area"
                            transform={`translate(${this.margin.left}, ${this.margin.right})`}
                        />
                        <rect
                            className="lst-svg-line-chart--zoom-area"
                            ref={ref => (this.graphInteractionArea = ref)}
                            width={this.state.chartWidth}
                            height={this.state.chartHeight}
                            transform={`translate(${this.margin.left}, ${this.margin.right})`}
                        />
                    </svg>
                    {this._renderChartLegend()}
                </div>
            </Fragment>
        );
    }

    _renderTitle(title) {
        if (isString(title)) {
            return (
                <h4 className="lst-css-line-chart--title lst-no-margin">
                    {title}
                </h4>
            );
        }

        return null;
    }

    _renderAxis() {
        // Rendering the grid system for the y axis
        this.graphAreaD3
            .append('g')
            .attr('class', 'lst-css-line-chart--grid y-grid')
            .call(this.yGridAxis);

        // Render the y domain scale in the graph area
        this.graphAreaD3
            .append('g')
            .attr('class', 'y-axis')
            .call(this.yAxis);

        // Render the x domain scale in the graph area
        this.graphAreaD3
            .append('g')
            .attr('transform', `translate(0,  ${this.state.chartHeight})`)
            .attr('class', 'x-axis')
            .call(this.xAxis);

        // Renders the y axis label if the `yAxisLabel` prop exists
        if (isString(this.props.yAxisLabel)) {
            this.graphAreaD3
                .append('text')
                .attr('class', 'axis-label')
                .attr('transform', 'rotate(-90)')
                .attr('y', -this.margin.left)
                .attr('x', -(this.state.chartHeight / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text(this.props.yAxisLabel);
        }
    }

    _renderChartLines() {
        [...this.props.data].reverse().forEach(chart => {
            const line = d3
                .line()
                .curve(d3.curveMonotoneX)
                .x(item => this.xScale(item.timestamp))
                .y(item => this.yScale(item[chart.yValues]));

            this.lines.push(line);

            this.graphAreaD3
                .datum(this.state.data)
                .append('path')
                .attr('id', chart.yValues)
                .attr('class', 'line-chart')
                .attr('fill', 'none')
                .attr('clip-path', `url(#${this.graphID}`)
                .attr('stroke', chart.color)
                .attr('stroke-width', this.props.lineWidth)
                .attr('d', line)
                .style('stroke-dasharray', () => {
                    return (chart.type === 'dashed') ? ('3, 3') : ('3, 0');
                });
        });
    }

    _renderChartLegend() {
        if (this.props.legend) {
            return (
                <div
                    className="lst-css-line-chart--legend"
                    ref={ref => (this.chartLegend = ref)}
                >
                    <ul>
                        {this.props.data.map(item => {
                            const labelClassName = classnames({
                                'lst-line-through': this.state.hiddenOptions.includes(
                                    item.yValues
                                ),
                            });

                            return (
                                <li key={`${this.graphID}-${item.label}`}>
                                    <Button
                                        className="lst-css-line-chart--legend__item"
                                        noStyle
                                        noAnimation
                                        onClick={() =>
                                            this._onClickToggleVisibility(
                                                item.yValues
                                            )
                                        }
                                    >
                                        <span
                                            className="lst-round"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />
                                        <span className={labelClassName}>
                                            {item.label}
                                        </span>
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }

        return null;
    }

    _initializeChart() {
        this.xScale = d3
            .scaleTime()
            .range([0, this.state.chartWidth])
            .domain(d3.extent(this.state.data, item => item.timestamp));

        this.densityChartXScale = d3
            .scaleTime()
            .domain([
                d3.min(this.state.data, item => item.timestamp),
                d3.max(this.state.data, item => item.timestamp),
            ])
            .range([0, this.state.chartWidth]);

        this.xAxis = d3.axisBottom(this.xScale);

        this.yScale = d3.scaleLinear().range([this.state.chartHeight, 0]);

        this.yAxis = d3
            .axisLeft(this.yScale)
            .ticks(this.props.yAxisTick)
            .tickFormat(d3.format('.2s'));

        this.yGridAxis = d3
            .axisLeft(this.yScale)
            .ticks(this.props.yAxisTick)
            .tickFormat('')
            .tickSize(-this.state.chartWidth, 0, 0);

        this._updateYDomain();

        this.graphAreaD3 = d3.select(this.graphArea);

        this._initializeD3Events();

        this._renderAxis();
        this._renderChartLines();
    }

    _initializeD3Events() {
        const zoom = d3
            .zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([
                [0, 0],
                [this.state.chartWidth, this.state.chartHeight],
            ])
            .extent([[0, 0], [this.state.chartWidth, this.state.chartHeight]])
            .on('zoom', this._onZoom);

        d3.select(this.graphInteractionArea).call(zoom);
    }

    _getMaxY(item) {
        const obj = omit(
            pick(item, this.state.dataKeys),
            this.state.hiddenOptions
        );
        const values = Object.values(obj);
        const max = Math.ceil(Math.max(...values));

        return Number.isInteger(max) ? max : 1;
    }

    _getMinY(item) {
        const obj = omit(
            pick(item, this.state.dataKeys),
            this.state.hiddenOptions
        );
        const values = Object.values(obj);
        const min = Math.ceil(Math.min(...values));

        return Number.isInteger(min) ? min : 0;
    }

    _updateChart() {
        this._updateYDomain();

        const lines = this.lines;

        this.graphAreaD3.selectAll('.line-chart').each(function(data, index) {
            d3.select(this).attr('d', lines[index]);
        });
    }

    _updateYDomain() {
        let minDomainY = d3.min(this.state.data, this._getMinY);
        let maxDomainY = d3.max(this.state.data, this._getMaxY);
        const intervalY = (maxDomainY - minDomainY) / this.props.yAxisTick;

        if (minDomainY !== 0) {
            minDomainY = minDomainY - intervalY;
        }

        maxDomainY = maxDomainY + intervalY;

        this.yScale.domain([minDomainY, maxDomainY]);

        if (isObject(this.graphAreaD3)) {
            this.graphAreaD3.select('.y-axis').call(this.yAxis);
            this.graphAreaD3.select('.y-grid').call(this.yGridAxis);
        }
    }
}

LineChart.defaultProps = defaultProps;

export default asyncLoader(LineChart, {
    asyncRequests: {
        rawData: props => props.asyncData(),
    },
});
