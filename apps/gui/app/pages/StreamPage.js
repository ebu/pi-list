import React, { Component } from 'react';
import api from 'utils/api';
import { translate } from 'utils/translation';
import asyncLoader from 'components/asyncLoader';
import errorEnum from 'enums/errorEnum';
import routeNames from 'config/routeNames';
import VideoPage from 'containers/VideoPage';
import AudioPage from 'containers/AudioPage';

class StreamPage extends Component {
    constructor(props) {
        super(props);
    }

    isVideo() {
        return this.props.streamInfo.media_type === 'video';
    }

    isAudio() {
        return this.props.streamInfo.media_type === 'audio';
    }

    renderAudio() {
        const { pcapID, streamID } = this.props.match.params;
        return (<AudioPage streamInfo={this.props.streamInfo} pcapID={pcapID} streamID={streamID} />);
    }

    renderVideo() {
        const { pcapID, streamID } = this.props.match.params;
        return (<VideoPage streamInfo={this.props.streamInfo} pcapID={pcapID} streamID={streamID} />);
    }

    render() {
        return this.isVideo() ? this.renderVideo() : this.renderAudio();
    }
}

export default asyncLoader(StreamPage, {
    asyncRequests: {
        streamInfo: (props) => {
            const { pcapID, streamID } = props.match.params;
            return api.getStreamInformation(pcapID, streamID);
        }
    },
    errorPage: {
        message: translate('errors.stream-marked-as-unknown'),
        errorType: errorEnum.STREAM_NOT_ANALYSED,
        icon: 'help',
        button: {
            label: 'Configure Stream',
            onClick: (props) => {
                const { pcapID, streamID } = props.match.params;
                props.history.push(`${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/${streamID}/${routeNames.CONFIGURE}`);
            }
        }
    }
});
