import React, { Component, Fragment } from 'react';
import Toggle from 'react-toggle';
import NetworkInfo from 'containers/streamPage/NetworkInfo';
import VideoInfo from 'containers/streamPage/VideoInfo';
import VideoStatistics from 'containers/streamPage/VideoStatistics';
import Dash21Info from 'containers/streamPage/Dash21Info';
import Panel from 'components/common/Panel';
import websocketEventsEnum from 'enums/websocketEventsEnum';
import websocket from 'utils/websocket';
import chartFormatters from 'utils/chartFormatters';
import Chart from 'components/StyledChart';

const maxHistoryArraySize = 60;
const fillArray = () => Array(maxHistoryArraySize).fill({ value: 0, time: 1 });

class VideoPage extends Component {
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
                point_radius={2}
                xLabel=""
                title={title}
                height={300}
            />
        );
    }

    renderChart(data, title) {
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

        const networkInfo = streamInfo.network_information;
        const statistics = streamInfo.statistics;
        const mediaInfo = streamInfo.media_specific;
        const globalVideoAnalysis = streamInfo.global_video_analysis;

        return (
            <div className="lst-stream-info-tab lst-full-height">
                <div className="row">
                    <Panel className="col-xs-12 col-md-4">
                        <Dash21Info {...globalVideoAnalysis} />
                        <NetworkInfo {...networkInfo} packet_count={statistics.packet_count} />
                        <VideoInfo {...mediaInfo} />
                        <VideoStatistics {...statistics} />
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

export default VideoPage;
