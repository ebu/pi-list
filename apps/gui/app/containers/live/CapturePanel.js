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
import Icon from '../../components/common/Icon';

const SdpStatus = ({ errors }) => {
    if (errors === null || errors === undefined) {
        return null;
    }

    if (errors.length === 0) {
        return (
            <div className="lst-sdp-result-pane">
                <div className="lst-sdp-result-pane-header">
                    <Icon className="lst-color-ok lst-margin--right-05" value="done_all" />
                    <span>SDP OK</span>
                </div>
            </div>
        );
    }

    const lines = errors.map((e, index) => (
        <div className="lst-sdp-error-line" key={index}>
            {e}
        </div>
    ));

    return (
        <div className="lst-sdp-result-pane">
            <div className="lst-sdp-result-pane-header">
                <Icon className="lst-sdp-result-pane-error-icon" value="close" />
                <span>SDP has errors</span>
            </div>
            {lines}
        </div>
    );
};

class CapturePanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stream: [
                { src: '', dstAddr: '', dstPort: '' }
            ],
            duration: 1000,
            name: Date.now(),
            capturing: false,
            sdpErrors: null
        };

        this.startCapture = this.startCapture.bind(this);
        this.onSdpParsed = this.onSdpParsed.bind(this);
        this.onSdpValidated = this.onSdpValidated.bind(this);
        this.onStreamsChanged = this.onStreamsChanged.bind(this);
    }

    componentDidMount() {
        websocket.on(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
        websocket.on(websocketEventsEnum.LIVE.SDP_VALIDATION_RESULTS, this.onSdpValidated);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
        websocket.off(websocketEventsEnum.LIVE.SDP_VALIDATION_RESULTS, this.onSdpValidated);
    }

    onSdpParsed(data) {
        if (data.success === false) {
            this.setState({
                sdpErrors: ['Error parsing SDP file']
            });
            return;
        }

        this.setState({
            name: data.description,
            stream: data.streams.map(str => {
                return { src: str.src, dstAddr: str.dstAddr, dstPort: str.dstPort };
            })
        });
    }

    onSdpValidated(data) {
        this.setState({
            sdpErrors: data.errors
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
        this.setState({
            stream: newStreams,
            sdpErrors: null,
            name: '',
        });
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
                <SdpStatus errors={this.state.sdpErrors} />
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
