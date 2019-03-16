import React, { Component } from 'react';
import _ from 'lodash';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import { translate } from '../../utils/translation';
import api from '../../utils/api';
import notifications from '../../utils/notifications';
import Input from '../../components/common/Input';
import FormInput from '../../components/common/FormInput';
import websocket from '../../utils/websocket';
import websocketEventsEnum from '../../enums/websocketEventsEnum';
import StreamsListPanel from './StreamsListPanel';

class CapturePanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stream: [
                { src: '', dstAddr: '', dstPort: '' }
            ],
            duration: 1000,
            name: Date.now(),
            capturing: false
        };

        this.startCapture = this.startCapture.bind(this);
        this.onSdpParsed = this.onSdpParsed.bind(this);
        this.onStreamsChanged = this.onStreamsChanged.bind(this);
    }

    componentDidMount() {
        websocket.on(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
    }

    onSdpParsed(data) {
        this.setState({
            name: data.description,
            stream: data.streams.map(str => {
                return { src: str.src, dstAddr: str.dstAddr, dstPort: str.dstPort };
            })
        });
    }

    startCapture() {
        this.setState(
            prevState => Object.assign({}, ...prevState, { capturing: true }),
            () => {
                api.subscribePCAP(this.state)
                    .then(() => {
                        notifications.success({
                            title: translate('notifications.success.stream_analysis'),
                            message: translate('notifications.success.stream_capture_message')
                        });
                        this.setState({ capturing: false });
                    })
                    .catch((error) => {
                        notifications.error({
                            title: translate('notifications.error.stream_analysis'),
                            message: translate('notifications.error.stream_capture_message')
                        });
                        this.setState({ capturing: false });
                    });
            });
    }

    onStreamsChanged(newStreams) {
        this.setState({ stream: newStreams });
    }

    render() {
        const colSizes = { labelColSize: 1, valueColSize: 11 };

        return (
            <div>
                <div className="lst-sdp-config lst-no-margin">
                    <FormInput icon="cast" {...colSizes}>
                        <StreamsListPanel streams={this.state.stream} handleChange={this.onStreamsChanged} />
                    </FormInput>
                    <FormInput icon="timer" {...colSizes}>
                        <Input
                            width="4rem"
                            type="number"
                            min="0"
                            value={this.state.duration}
                            onChange={evt => this.setState({ duration: parseInt(evt.currentTarget.value, 10) })}
                        /> <span>ms</span>
                    </FormInput>
                    <FormInput icon="label" {...colSizes}>
                        <Input
                            type="text"
                            value={this.state.name}
                            onChange={evt => this.setState({ name: evt.target.value })}
                        />
                    </FormInput>

                </div>
                <div className="row end-xs lst-text-right lst-no-margin">
                    <Button
                        type="info"
                        label={translate('workflow.start_capture')}
                        onClick={this.startCapture}
                        disabled={this.state.capturing}
                    />
                </div>
            </div>
        );
    }
}

export default CapturePanel;
