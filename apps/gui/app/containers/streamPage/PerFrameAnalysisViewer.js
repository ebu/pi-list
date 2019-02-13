import React, { Component } from 'react';
import api from 'utils/api';
import asyncLoader from 'components/asyncLoader';
import StreamTimeline from 'components/stream/StreamTimeline';
import chartFormatters from 'utils/chartFormatters';
import LineChart from 'components/LineChart';

class PerFrameAnalysisViewer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            first_packet_ts: 0,
            last_packet_ts: 0,
        };
    }

    render() {
        return (
            <React.Fragment>
                <div className="row">
                    <StreamTimeline
                        pcapID={this.props.pcapID}
                        streamID={this.props.streamID}
                        frames={this.props.frames}
                        onFrameChange={(frame) => {
                            if (frame) {
                                this.setState({
                                    first_packet_ts: frame.first_packet_ts,
                                    last_packet_ts: frame.last_packet_ts
                                });
                            }
                        }}
                    />
                </div>
                <div className="row">
                    <div className="col-xs-12 col-md-12">
                        <LineChart
                            key={this.state.first_packet_ts}
                            asyncData={() => api.getCInstRaw(this.props.pcapID, this.props.streamID, this.state.first_packet_ts, this.state.last_packet_ts)}
                            xAxis={chartFormatters.getTimeLineLabel}
                            data={chartFormatters.singleValueLineChart}
                            title="CInst"
                            yAxisLabel="packets"
                            height={300}
                            lineWidth={3}
                        />
                        <LineChart
                            key={this.state.first_packet_ts + "s"}
                            asyncData={() => api.getVrxIdealRaw(this.props.pcapID, this.props.streamID, this.state.first_packet_ts, this.state.last_packet_ts)}
                            xAxis={chartFormatters.getTimeLineLabel}
                            data={chartFormatters.singleValueLineChart}
                            title="Vrx"
                            yAxisLabel="packets"
                            height={300}
                            lineWidth={3}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default asyncLoader(PerFrameAnalysisViewer, {
    asyncRequests: {
        frames: (props) => {
            const { pcapID, streamID } = props;

            return api.getFramesFromStream(pcapID, streamID);
        }
    }
});
