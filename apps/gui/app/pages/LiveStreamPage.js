import React, { Component } from 'react';
import api from 'utils/api';
import { translate } from 'utils/translation';
import asyncLoader from 'components/asyncLoader';
import errorEnum from 'enums/errorEnum';
import LiveVideoPage from 'containers/LiveVideoPage';
import AudioPage from 'containers/AudioPage';
import { withRouter } from 'react-router-dom';

class LiveStreamPage extends Component {
    isVideo() {
        return this.props.streamInfo.media_type === 'video';
    }

    renderAudio() {
        const { streamID } = this.props.match.params;
        return (<AudioPage streamInfo={this.props.streamInfo} pcapID="live-pcap" streamID={streamID} />);
    }

    renderVideo() {
        return (<LiveVideoPage streamInfo={this.props.streamInfo} />);
    }

    render() {
        return this.isVideo() ? this.renderVideo() : this.renderAudio();
    }
}

export default withRouter(asyncLoader(LiveStreamPage, {
    asyncRequests: {
        streamInfo: (props) => {
            const { streamID } = props.match.params;
            return api.getLiveStream(streamID);
        }
    },
    errorPage: {
        message: translate('errors.404_message'),
        errorType: errorEnum.PAGE_NOT_FOUND,
        icon: 'help'
    }
}));
