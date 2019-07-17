import React, { Component } from 'react';
import api from 'utils/api';
import asyncLoader from 'components/asyncLoader';
import LiveStreamCard from 'components/liveStream/LiveStreamCard';
import websocket from 'utils/websocket';
import websocketEventsEnum from 'enums/websocketEventsEnum';
import immutable from 'utils/immutable';
import Panel from 'components/common/Panel';
import FormInput from 'components/common/FormInput';
import ErrorPage from 'components/ErrorPage';
import Toggle from 'react-toggle';
import { getIcon } from 'utils/mediaUtils';
import { translate } from 'utils/translation';
import { Scrollbars } from 'react-custom-scrollbars';
import notifications from 'utils/notifications';

class LiveStreamList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            streams: this.props.availableStreams,
            showErrorOnly: false,
            showOnlineOnly: true,
            showVideoOnly: false,
            showAudioOnly: false,
        };

        this.onStreamUpdate = this.onStreamUpdate.bind(this);
        this.handleSimpleChange = this.handleSimpleChange.bind(this);
        this.handleDeleteStream = this.handleDeleteStream.bind(this);
    }

    componentDidMount() {
        websocket.on(
            websocketEventsEnum.LIVE.STREAM_UPDATE,
            this.onStreamUpdate
        );
    }

    componentWillUnmount() {
        websocket.off(
            websocketEventsEnum.LIVE.STREAM_UPDATE,
            this.onStreamUpdate
        );
    }

    onStreamUpdate(data) {
        const newStream =
            this.state.streams.findIndex(element => element.id === data.id) ===
            -1;
        if (newStream) {
            this.setState({
                streams: [
                    ...this.state.streams,
                    {
                        ...data,
                    },
                ],
            });
        } else {
            const streams = immutable.findAndUpdateElementInArray(
                { id: data.id },
                this.state.streams,
                {
                    ...data,
                }
            );
            this.setState({ streams });
        }
    }

    handleSimpleChange(name, event) {
        this.setState({ [name]: event.target.checked });
    }

    handleDeleteStream(streamID) {
        api.deleteLiveStream(streamID)
            .then(() => {
                const streams = immutable.findAndRemoveElementInArray(
                    { id: streamID },
                    this.state.streams
                );
                this.setState({ streams });

                notifications.success({
                    title: translate('notifications.success.stream_deleted'),
                    message: translate(
                        'notifications.success.stream_deleted_message'
                    ),
                });
            })
            .catch(() => {
                notifications.error({
                    title: translate('notifications.error.stream_deleted'),
                    message: translate(
                        'notifications.error.stream_deleted_message'
                    ),
                });
            });
    }

    renderColumn(title, icon, streams) {
        const normalSize = streams.length < 16;
        const perRow = normalSize ? 3 : 2;

        return (
            <div className="row">
                {streams.map((stream, index) => {
                    return (
                        <div className={`col-md-${perRow}`}>
                            <LiveStreamCard
                                key={stream.id}
                                title={`Stream #${index + 1}`}
                                lowInformation={!normalSize}
                                onDeleteButtonClicked={this.handleDeleteStream}
                                {...stream}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    renderFilters(filters) {
        return filters.map(filter => {
            return (
                <div className="col-xs-12">
                    <FormInput
                        label={filter.label}
                        className="lst-no-margin"
                        labelColSize={8}
                        valueColSize={4}
                    >
                        <Toggle
                            checked={filter.value}
                            onChange={e =>
                                this.handleSimpleChange(filter.valueName, e)
                            }
                        />
                    </FormInput>
                </div>
            );
        });
    }

    render() {
        const filteredStreams = this.state.streams.filter(elem => {
            const errorOnly = this.state.showErrorOnly
                ? elem.global_video_analysis.compliance === 'not_compliant'
                : true;
            const onlineOnly = this.state.showOnlineOnly
                ? elem.state === 'on_going_analysis'
                : true;
            const videoOnly = this.state.showVideoOnly
                ? elem.media_type === 'video'
                : true;
            const audioOnly = this.state.showAudioOnly
                ? elem.media_type === 'audio'
                : true;

            return errorOnly && onlineOnly && videoOnly && audioOnly;
        });

        const maxHeight = `calc(90vh)`; // todo: check this!!!!

        if (filteredStreams.length === 0) {
            return (
                <ErrorPage
                    title={translate('live_stream.no_streams')}
                    errorMessage={translate('live_stream.no_streams_message')}
                    icon="feedback"
                />
            );
        }

        return (
            <div className="row">
                <div className="col-xs-12 col-md-10">
                    <Scrollbars
                        hideTracksWhenNotNeeded
                        autoHeight
                        autoHeightMax={maxHeight}
                    >
                        {this.renderColumn(
                            translate('headings.video'),
                            getIcon('video'),
                            filteredStreams
                        )}
                    </Scrollbars>
                </div>
                <div className="col-xs-12 col-md-2">
                    <Panel
                        icon="filter_list"
                        title={translate('headings.filters')}
                        containerClassName="row lst-no-margin"
                    >
                        {this.renderFilters([
                            {
                                label: translate('filters.show_error_only'),
                                value: this.state.showErrorOnly,
                                valueName: 'showErrorOnly',
                            },
                            {
                                label: translate('filters.show_online_only'),
                                value: this.state.showOnlineOnly,
                                valueName: 'showOnlineOnly',
                            },
                            {
                                label: translate('filters.show_video_only'),
                                value: this.state.showVideoOnly,
                                valueName: 'showVideoOnly',
                            },
                            {
                                label: translate('filters.show_audio_only'),
                                value: this.state.showAudioOnly,
                                valueName: 'showAudioOnly',
                            },
                        ])}
                    </Panel>
                </div>
            </div>
        );
    }
}

export default asyncLoader(LiveStreamList, {
    asyncRequests: {
        availableStreams: () => api.getLiveStreams(),
    },
});
