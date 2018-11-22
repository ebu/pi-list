import React, { Component } from 'react';
import api from 'utils/api';
import { pluralize, translate } from 'utils/translation';
import asyncLoader from 'components/asyncLoader';
import errorEnum from 'enums/errorEnum';
import VideoPage from 'containers/VideoPage';
import AudioPage from 'containers/AudioPage';
import AncillaryPage from 'containers/AncillaryPage';
import ErrorPage from 'components/ErrorPage';
import routeBuilder from 'utils/routeBuilder';

class StreamPage extends Component {
    renderAudio() {
        const { pcapID, streamID } = this.props.match.params;
        return (<AudioPage streamInfo={this.props.streamInfo} pcapID={pcapID} streamID={streamID} />);
    }

    renderVideo() {
        const { pcapID, streamID } = this.props.match.params;
        return (<VideoPage streamInfo={this.props.streamInfo} pcapID={pcapID} streamID={streamID} />);
    }

    renderAncillary() {
        const { pcapID, streamID } = this.props.match.params;
        return (<AncillaryPage streamInfo={this.props.streamInfo} pcapID={pcapID} streamID={streamID} />);
    }

    renderError(errorMessage, errorType) {
        return (
            <ErrorPage
                errorMessage={errorMessage}
                errorType={errorType}
                icon="feedback"
                button={{
                    label: pluralize('stream.configure_streams', 1),
                    onClick: () => {
                        const { pcapID, streamID } = this.props.match.params;
                        this.props.history.push(routeBuilder.stream_config_page(pcapID, streamID));
                    }
                }}
            />
        );
    }

    render() {
        // if the stream is not analyzed, we need to render an error
        if (this.props.streamInfo.state !== 'analyzed') {
            return this.renderError(translate('errors.stream-marked-as-unknown'), errorEnum.STREAM_NOT_ANALYSED);
        }

        switch (this.props.streamInfo.media_type) {
        case 'video': return this.renderVideo();
        case 'audio': return this.renderAudio();
        case 'ancillary_data': return this.renderAncillary();
        default:
            return (
                <ErrorPage
                    errorMessage={translate('errors.not_supported_message', { name: this.props.streamInfo.media_type })}
                    errorType={translate('errors.not_supported')}
                    icon="feedback"
                />

            );
        }
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
        message: translate('errors.404_message'),
        errorType: errorEnum.PAGE_NOT_FOUND,
        icon: 'help'
    }
});
