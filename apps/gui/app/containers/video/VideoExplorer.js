import React, { Component } from 'react';
import api from 'utils/api';
import { isString } from 'lodash';
import asyncLoader from 'components/asyncLoader';
import Panel from 'components/common/Panel';
import VideoTimeline from 'components/stream/VideoTimeline';
import Badge from 'components/common/Badge';

class VideoExplorer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            packets: [],
            selectedPacket: 0,
        };
    }

    render() {
        return (
            <div className="row">
                <VideoTimeline
                    pcapID={this.props.pcapID}
                    streamID={this.props.streamID}
                    frames={this.props.frames}
                    initFrameIndex={0}
                    onFrameChange={(index, frame) => {
                        if (frame) {
                            api.getPacketsFromFrame(this.props.pcapID, this.props.streamID, frame.timestamp)
                                .then((packets) => {
                                    this.setState({ packets, selectedPacket: 0 });
                                });
                        }

                    }}
                />
                <div className="row">
                    <div className="col-xs-8 lst-no-padding">
                        <div
                            className="row"
                            onClick={(evt) => {
                                if (isString(evt.target.dataset.packet)) {
                                    this.setState({
                                        selectedPacket: parseInt(evt.target.dataset.packet, 10)
                                    });
                                }
                            }}
                        >
                            {this.state.packets.map((packet, index) => (
                                <div
                                    data-packet={index}
                                    key={`${packet.packet_time}-${index}`}
                                    className="lst-stream-packet lst-text-center"
                                >
                                    {index + 1}
                                </div>))}
                        </div>
                    </div>
                    <div className="col-xs-4 lst-no-padding">
                        {this.state.packets.length > 0 && (
                            <Panel>
                                <h3>
                                    <strong>Packet {this.state.selectedPacket + 1}</strong>
                                    <Badge
                                        type={this.state.packets[this.state.selectedPacket].marker ? 'success' : 'danger'}
                                        text={this.state.packets[this.state.selectedPacket].marker ? 'Marker Bit Set' : 'No Marker Bit'}
                                    />
                                </h3>
                                <ul>
                                    <li>
                                        <strong>Sequence Number: </strong>
                                        <span>{this.state.packets[this.state.selectedPacket].sequence_number}</span>
                                    </li>
                                    <li>
                                        <strong>Packet Time: </strong>
                                        <span>{this.state.packets[this.state.selectedPacket].packet_time} ns</span>

                                    </li>
                                    <li>
                                        <strong>RTP Timestamp: </strong>
                                        <span>{this.state.packets[this.state.selectedPacket].rtp_timestamp}</span>
                                    </li>
                                </ul>
                            </Panel>)}
                    </div>
                </div>
            </div>
        );
    }
}

export default asyncLoader(VideoExplorer, {
    asyncRequests: {
        frames: (props) => {
            const { pcapID, streamID } = props;

            return api.getFramesFromStream(pcapID, streamID);
        }
    }
});
