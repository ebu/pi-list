import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import api from '../utils/api';
import asyncLoader from '../components/asyncLoader';
import LiveVideoPage from '../containers/live/LiveVideoPage';
import AudioPage from '../containers/AudioPage/index';

class LiveStreamPage extends Component {
    isVideo() {
        return this.props.streamInfo.media_type === 'video';
    }

    isAudio() {
        return this.props.streamInfo.media_type === 'audio';
    }

    render() {
        if (this.isVideo()) {
            return <LiveVideoPage streamInfo={this.props.streamInfo} />;
        }
        if (this.isAudio()) {
            const { streamID } = this.props.match.params;
            return (
                <AudioPage
                    streamInfo={this.props.streamInfo}
                    pcapID="live-pcap"
                    streamID={streamID}
                />
            );
        }
        return <div>Unknown stream type</div>;
    }
}

export default withRouter(
    asyncLoader(LiveStreamPage, {
        asyncRequests: {
            streamInfo: (props) => {
                const { streamID } = props.match.params;
                return api.getLiveStream(streamID);
            },
        },
    })
);
