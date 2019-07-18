import React, { Component, Fragment } from 'react';
import Toggle from 'react-toggle';
import NetworkInfo from 'containers/streamPage/NetworkInfo';
import VideoInfo from 'containers/streamPage/VideoInfo';
import Dash21Info from 'containers/streamPage/Dash21Info';
import Panel from 'components/common/Panel';
import websocketEventsEnum from 'enums/websocketEventsEnum';
import websocket from 'utils/websocket';
import chartFormatters from 'utils/chartFormatters';
import Chart from 'components/StyledChart';

const maxHistoryArraySize = 60;
const fillArray = () => Array(maxHistoryArraySize).fill({ value: 0, time: 1 });

// data is an array of [ value, pergentage ]
// this function:
// - adds all the items which value is less than (min)
// - adds all the items which value is grater than (max)
// - creates an entry for each missing value between [<min,max] with percentage = 0
function normalizeHistogramData(data) {
    // TODO: get these from Cfull and VRXmax
    const min = 0;
    const max = 16;

    if (!data || !data.histogram || data.histogram.length == 0) return [];
    const newData = new Map();
    for(var i = min - 1; i <= max + 1; ++i) {
        newData.set(i, 0);
    }

    data.histogram.forEach((entry) => {
        const [k, v] = entry;
        var realK = k;
        if(k > max) realK = max + 1;
        if(k < min) realK = min - 1;

        const newValue = newData.get(realK) + v;
        newData.set(realK, newValue);
    });

    const arrayData = [];
    newData.forEach((v, k) => {
        arrayData.push([k, v]);
    });

    arrayData[0] = [ '<', arrayData[0][1] ];
    arrayData[arrayData.length - 1] = [ '>', arrayData[arrayData.length - 1][1] ];

    return arrayData;
}

class LiveVideoPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            streamInfo: this.props.streamInfo,
            showGlobalValues: false,
            lastMinuteVrx: fillArray(),
            lastMinuteCInst: fillArray()
        };

        this.onStreamUpdate = this.onStreamUpdate.bind(this);
        this.renderToggle = this.renderToggle.bind(this);
        this.handleSimpleChange = this.handleSimpleChange.bind(this);
        this.renderLastMinuteChart = this.renderLastMinuteChart.bind(this);
    }

    componentDidMount() {
        websocket.on(websocketEventsEnum.LIVE.STREAM_UPDATE, this.onStreamUpdate);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.LIVE.STREAM_UPDATE, this.onStreamUpdate);
    }

    onStreamUpdate(data) {
        if (data.id !== this.props.streamInfo.id) return;

        this.setState((prevState) => {
            const vrxHist = data.current_video_analysis.vrx.histogram;
            const cinstHist = data.current_video_analysis.cinst.histogram;

            return {
                streamInfo: data,
                lastMinuteVrx: this.updateLastMinute(vrxHist, prevState.lastMinuteVrx),
                lastMinuteCInst: this.updateLastMinute(cinstHist, prevState.lastMinuteCInst)
            };
        });
    }

    /* Remove me after demo */
    getKeyForHighestValue(data) {
        if (!data || data.length === 0) return 0;
        const max = data[data.length - 1][0];
        return max;
    }

    handleSimpleChange(name, event) {
        this.setState({ [name]: event.target.checked });
    }

    updateLastMinute(histogram, prevArray) {
        const biggestValue = this.getKeyForHighestValue(histogram);
        const size = prevArray.push({ value: biggestValue, time: 1 });
        return size < maxHistoryArraySize ? prevArray : prevArray.slice(1, maxHistoryArraySize + 1);
    }

    renderLastMinuteChart(data, title) {
        return (
            <Chart
                type="line"
                rawData={data}
                request={() => data}
                labels={chartFormatters.getTimeLineLabel}
                formatData={chartFormatters.singleValueChart}
                point_radius={1}
                xLabel=""
                title={title}
                height={300}
            />
        );
    }

    renderChart(rawData, title) {
        const data = { histogram: normalizeHistogramData(rawData) };
        return (
            <Chart
                type="bar"
                rawData={data}
                request={() => data}
                labels={chartFormatters.cinstHistogramValues}
                formatData={chartFormatters.cinstHistogramCounts}
                xLabel=""
                title={title}
                height={300}
                yLabel="%"
                displayXTicks="true"
                ticksMax={100}
                ticksMin={0}
            />
        );
    }

    renderToggle(stateField) {
        return (
            <Fragment>
                <label htmlFor={stateField}>Global </label>
                <Toggle
                    id={stateField}
                    checked={this.state[stateField]}
                    onChange={e => this.handleSimpleChange(stateField, e)}
                    icons={{
                        checked: null,
                        unchecked: null,
                    }}
                />
            </Fragment>
        );
    }

    render() {
        const streamInfo = this.state.streamInfo;

        const toRenderCInst = this.state.showGlobalValues ? streamInfo.global_video_analysis.cinst : streamInfo.current_video_analysis.cinst;
        const toRenderCInstTitle = this.state.showGlobalValues ? 'Global' : 'Last second';

        const toRenderVrx = this.state.showGlobalValues ? streamInfo.global_video_analysis.vrx : streamInfo.current_video_analysis.vrx;
        const toRenderVrxTitle = this.state.showGlobalValues ? 'Global' : 'Last second';

        const mediaInfo = streamInfo.media_specific;
        const globalVideoAnalysis = streamInfo.global_video_analysis;

        return (
            <div className="lst-stream-info-tab lst-full-height">
                <div className="row">
                    <Panel className="col-xs-12 col-md-4">
                        <Dash21Info {...globalVideoAnalysis} />
                        <NetworkInfo stream={this.props.streamInfo} />
                        <VideoInfo {...mediaInfo} />
                    </Panel>
                    <div className="col-xs-12 col-md-8">
                        <div className="row">
                            <Panel className="col-xs-12" title="CInst" rightToolbar={this.renderToggle('showGlobalValues')}>
                                <div className="row">
                                    <div className="col-xs-12 col-md-6">
                                        {this.renderChart(toRenderCInst, toRenderCInstTitle)}
                                    </div>
                                    <div className="col-xs-12 col-md-6">
                                        {this.renderLastMinuteChart(this.state.lastMinuteCInst, 'C peak Timeline')}
                                    </div>
                                </div>
                            </Panel>
                            <Panel className="col-xs-12" title="Vrx" rightToolbar={this.renderToggle('showGlobalValues')}>
                                <div className="row">
                                    <div className="col-xs-12 col-md-6">
                                        {this.renderChart(toRenderVrx, toRenderVrxTitle)}
                                    </div>
                                    <div className="col-xs-12 col-md-6">
                                        {this.renderLastMinuteChart(this.state.lastMinuteVrx, 'Vrx peak Timeline')}
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LiveVideoPage;
