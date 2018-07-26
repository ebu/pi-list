import React, { Component } from 'react';
import api from 'utils/api';
import asyncLoader from 'components/asyncLoader';
import StreamColumn from 'components/stream/StreamColumn';
import LiveStreamCard from 'components/liveStream/LiveStreamCard';
import websocket from 'utils/websocket';
import websocketEventsEnum from 'enums/websocketEventsEnum';
import immutable from 'utils/immutable';
import Panel from 'components/common/Panel';
import FormInput from 'components/common/FormInput';
import Toggle from 'react-toggle';
import { getIcon } from 'utils/mediaUtils';
import { translate } from 'utils/translation';

class LiveStreamList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            streams: this.props.availableStreams,
            showErrorOnly: false,
            showOnlineOnly: true
        };

        this.onStreamUpdate = this.onStreamUpdate.bind(this);
        this.handleSimpleChange = this.handleSimpleChange.bind(this);
    }

    componentDidMount() {
        websocket.on(websocketEventsEnum.LIVE.STREAM_UPDATE, this.onStreamUpdate);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.LIVE.STREAM_UPDATE, this.onStreamUpdate);
    }

    onStreamUpdate(data) {
        const newStream = this.state.streams.findIndex(element => element.id === data.id) === -1;
        if (newStream) {
            this.setState({
                streams: [
                    ...this.state.streams,
                    {
                        ...data
                    }
                ]
            });
        } else {
            const streams = immutable.findAndUpdateElementInArray({ id: data.id }, this.state.streams, {
                ...data
            });
            this.setState({ streams });
        }
    }

    handleSimpleChange(name, event) {
        this.setState({ [name]: event.target.checked });
    }

    renderColumn(title, icon, streams) {
        return (
            <StreamColumn title={title} icon={icon}>
                {
                    streams.map((stream, index) => {
                        return (
                            <LiveStreamCard key={`Stream #${index + 1}`} title={`Stream #${index + 1}`} {...stream} />
                        );
                    })
                }
            </StreamColumn>
        );
    }

    render() {
        const filteredStreams = this.state.streams.filter((elem) => {
            const errorOnly = this.state.showErrorOnly ?
                elem.global_video_analysis.compliance === 'not_compliant' :
                true;
            const onlineOnly = this.state.showOnlineOnly ? elem.state === 'on_going_analysis' : true;

            return errorOnly && onlineOnly;
        });

        const videoStreams = filteredStreams.filter(elem => elem.media_type === 'video');
        const audioStreams = filteredStreams.filter(elem => elem.media_type === 'audio');

        return (
            <div className="row">
                <div className="col-xs-12 col-md-5">
                    {this.renderColumn(translate('headings.video'), getIcon('video'), videoStreams)}
                </div>
                <div className="col-xs-12 col-md-5">
                    {this.renderColumn(translate('headings.audio'), getIcon('audio'), audioStreams)}
                </div>
                <div className="col-xs-12 col-md-2">
                    <Panel icon="filter_list" title={translate('headings.filters')} containerClassName="row lst-no-margin">
                        <div className="col-xs-12">
                            <FormInput label={translate('filters.show_error_only')} className="lst-no-margin" labelColSize={8} valueColSize={4}>
                                <Toggle
                                    checked={this.state.showErrorOnly}
                                    onChange={e => this.handleSimpleChange('showErrorOnly', e)}
                                />
                            </FormInput>
                        </div>
                        <div className="col-xs-12">
                            <FormInput label={translate('filters.show_online_only')} className="lst-no-margin" labelColSize={8} valueColSize={4}>
                                <Toggle
                                    checked={this.state.showOnlineOnly}
                                    onChange={e => this.handleSimpleChange('showOnlineOnly', e)}
                                />
                            </FormInput>
                        </div>
                    </Panel>
                </div>
            </div>
        );
    }
}

export default asyncLoader(LiveStreamList, {
    asyncRequests: {
        availableStreams: () => api.getLiveStreams()
    }
});
