import React, { Component } from 'react';
import api from 'utils/api';
import asyncLoader from 'components/asyncLoader';
import VideoTimeline from 'components/stream/VideoTimeline';
import Graphs from '../../components/graphs';

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
                    <VideoTimeline
                        pcapID={this.props.pcapID}
                        streamID={this.props.streamID}
                        frames={this.props.frames}
                        onFrameChange={(index, frame) => {
                            if (frame) {
                                this.setState({
                                    first_packet_ts: frame.first_packet_ts,
                                    last_packet_ts: frame.last_packet_ts,
                                });
                            }
                        }}
                    />
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <Graphs.Line
                            key={this.state.first_packet_ts + '0'}
                            title="Cinst"
                            xTitle="Time (TAI)"
                            yTitleTag="media_information.rtp.packet_count"
                            asyncGetter={async () =>
                                api.getCInstRaw(
                                    this.props.pcapID,
                                    this.props.streamID,
                                    this.state.first_packet_ts,
                                    this.state.last_packet_ts
                                )
                            }
                            layoutProperties={{ yaxis: { tickformat: ',d' } }}
                        />
                        <Graphs.Line
                            key={this.state.first_packet_ts + '1'}
                            title="VRX"
                            xTitle="Time (TAI)"
                            yTitleTag="media_information.rtp.packet_count"
                            asyncGetter={() =>
                                api.getVrxIdealRaw(
                                    this.props.pcapID,
                                    this.props.streamID,
                                    this.state.first_packet_ts,
                                    this.state.last_packet_ts
                                )
                            }
                            layoutProperties={{ yaxis: { tickformat: ',d' } }}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default asyncLoader(PerFrameAnalysisViewer, {
    asyncRequests: {
        frames: props => {
            const { pcapID, streamID } = props;

            return api.getFramesFromStream(pcapID, streamID);
        },
    },
});
