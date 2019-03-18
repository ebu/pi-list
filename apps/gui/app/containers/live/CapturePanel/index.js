import React, { Component } from 'react';
import _ from 'lodash';
import Button from '../../../components/common/Button';
import { translate } from '../../../utils/translation';
import api from '../../../utils/api';
import notifications from '../../../utils/notifications';
import Input from '../../../components/common/Input';
import FormInput from '../../../components/common/FormInput';
import websocket from '../../../utils/websocket';
import websocketEventsEnum from '../../../enums/websocketEventsEnum';
import StreamsListPanel from '../StreamsListPanel';
import SdpStatus from './SdpStatus';
import moment from 'moment';

class CapturePanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            streams: [
                { src: '', dstAddr: '', dstPort: '' }
            ],
            duration: 1000,
            captureDescription: '',
            captureFullName: undefined,
            capturing: false,
            sdpErrors: null,
            now: this.getNow(),
            timer: null
        };

        this.startCapture = this.startCapture.bind(this);
        this.onSdpParsed = this.onSdpParsed.bind(this);
        this.onSdpValidated = this.onSdpValidated.bind(this);
        this.onStreamsChanged = this.onStreamsChanged.bind(this);
        this.onCaptureFullNameChanged = this.onCaptureFullNameChanged.bind(this);
        this.onCaptureFullNameChanged = this.onCaptureFullNameChanged.bind(this);
        this.onCaptureDescriptionChanged = this.onCaptureDescriptionChanged.bind(this);
        this.updateNow = this.updateNow.bind(this);
        this.getFullName = this.getFullName.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    componentDidMount() {
        const timer = setInterval(this.updateNow, 500);
        this.setState({ timer });
        websocket.on(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
        websocket.on(websocketEventsEnum.LIVE.SDP_VALIDATION_RESULTS, this.onSdpValidated);
        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }

        websocket.off(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
        websocket.off(websocketEventsEnum.LIVE.SDP_VALIDATION_RESULTS, this.onSdpValidated);
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown(event) {
        if (event.key === "Enter" && frameIndex > 0) {
            this.startCapture();
        }
    }

    getNow() {
        return moment(Date.now()).format('YYYYMMDD-hhmmss');
    }

    getFullName() {
        if (this.state.captureFullName !== undefined) {
            return this.state.captureFullName;
        }

        const streamNames = this.state.streams
            .map(stream => stream.dstAddr)
            .filter(name => name)
            .join('-');
        const streams = streamNames ? `-${streamNames}` : '';

        const desc = this.state.captureDescription ? `-${this.state.captureDescription}` : '';
        return `${this.state.now}${streams}${desc}`;
    }

    updateNow() {
        this.setState({ now: this.getNow() });
    }

    onSdpParsed(data) {
        if (data.success === false) {
            this.setState({
                sdpErrors: ['Error parsing SDP file']
            });
            return;
        }

        this.setState({
            captureFullName: data.description,
            streams: data.streams.map(str => {
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
        const captureFullName = this.getFullName();
        if (captureFullName === '') {
            return;
        }

        const captureInfo = Object.assign({}, {
            streams: this.state.streams,
            duration: this.state.duration,
            name: captureFullName
        });

        this.setState(
            prevState => Object.assign({}, ...prevState, { capturing: true }),
            () => {
                api.subscribePCAP(captureInfo)
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

    onCaptureFullNameChanged(value) {
        this.setState({ captureFullName: value });
    }

    onCaptureDescriptionChanged(value) {
        this.setState(
            {
                captureDescription: value,
                captureFullName: undefined
            }
        );
    }

    onStreamsChanged(newStreams) {
        this.setState({
            streams: newStreams,
            sdpErrors: null,
            captureFullName: undefined
        });
    }

    render() {
        const colSizes = { labelColSize: 1, valueColSize: 11 };

        const captureFullName = this.getFullName();

        return (
            <div>
                <div className="lst-sdp-config lst-no-margin">
                    <StreamsListPanel streams={this.state.streams} handleChange={this.onStreamsChanged} />
                    <hr />
                    <FormInput icon="timer" {...colSizes}>
                        <Input
                            width="4rem"
                            type="number"
                            min="0"
                            value={this.state.duration}
                            onChange={evt => this.setState({ duration: parseInt(evt.currentTarget.value, 10) })}
                        /> <span>ms</span>
                    </FormInput>
                    <FormInput icon="receipt" {...colSizes}>
                        <Input
                            type="text"
                            value={this.state.captureDescription}
                            onChange={evt => this.onCaptureDescriptionChanged(evt.target.value)}
                        />
                    </FormInput>
                </div>
                <SdpStatus errors={this.state.sdpErrors} />
                <hr />
                <div className="row lst-align-items-baseline">
                    <div className="col-xs-11 lst-no-margin">
                        <FormInput {...colSizes} icon="label">
                            <Input
                                type="text"
                                value={captureFullName}
                                onChange={evt => this.onCaptureFullNameChanged(evt.target.value)}
                            />
                        </FormInput>
                    </div>
                    <div className="col-xs-1">
                        <Button
                            className="lst-table-delete-item-btn"
                            icon="cancel"
                            type="info"
                            link
                            disabled={this.state.captureFullName === undefined}
                            onClick={() => this.setState({ captureFullName: undefined })}
                        />
                    </div>
                </div>
                <div className="row lst-text-right lst-no-margin end-xs">
                    <Button
                        type="info"
                        label={translate('workflow.start_capture')}
                        onClick={this.startCapture}
                        disabled={this.state.capturing || this.getFullName() === ''}
                    />
                </div>
            </div>
        );
    }
}

export default CapturePanel;
