import React, { Component } from 'react';
import api from 'utils/api';
import { translateX } from '../utils/translation';
import asyncLoader from '../components/asyncLoader';
import errorEnum from '../enums/errorEnum';
import VideoPage from '../containers/VideoPage';
import AudioPage from '../containers/AudioPage';
import AncillaryPage from '../containers/AncillaryPage';
import ErrorPage from '../components/ErrorPage';
import routeBuilder from '../utils/routeBuilder';

const StreamPage = props => {
    // if the stream is not analyzed, we need to render an error
    if (props.streamInfo.state !== 'analyzed') {
        const errorMessage = translateX('errors.stream_marked_as_unknown');
        const errorType = errorEnum.STREAM_NOT_ANALYSED;

        return (
            <ErrorPage
                errorMessage={errorMessage}
                errorType={errorType}
                icon="feedback"
                button={{
                    label: translateX('stream.configure_streams'),
                    onClick: () => {
                        const { pcapID, streamID } = props.match.params;
                        props.history.push(
                            routeBuilder.stream_config_page(pcapID, streamID)
                        );
                    },
                }}
            />
        );
    }

    const { pcapID, streamID } = props.match.params;

    switch (props.streamInfo.media_type) {
        case 'video':
            return (
                <VideoPage
                    streamInfo={props.streamInfo}
                    pcapID={pcapID}
                    streamID={streamID}
                />
            );

        case 'audio':
            return (
                <AudioPage
                    streamInfo={props.streamInfo}
                    pcapID={pcapID}
                    streamID={streamID}
                />
            );

        case 'ancillary_data':
            return (
                <AncillaryPage
                    streamInfo={props.streamInfo}
                    pcapID={pcapID}
                    streamID={streamID}
                />
            );

        default:
            return (
                <ErrorPage
                    errorMessage={translateX('errors.not_supported_message', {
                        name: props.streamInfo.media_type,
                    })}
                    errorType={translateX('errors.not_supported')}
                    icon="feedback"
                />
            );
    }
};

export default asyncLoader(StreamPage, {
    asyncRequests: {
        streamInfo: props => {
            const { pcapID, streamID } = props.match.params;
            return api.getStreamInformation(pcapID, streamID);
        },
    },
});
