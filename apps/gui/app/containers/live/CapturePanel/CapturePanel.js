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
import uuid from 'uuid/v4';

const captureStatus = {
    noCapture: 'noCapture',
    inProgress: 'inProgress',
    analyzing: 'analyzing',
    completed: 'completed',
    failed: 'failed'
};

const getCaptureStatusMessage = (status, captureErrorMessage) => {
    switch (status) {
        case captureStatus.noCapture:
            return <span />;
        case captureStatus.inProgress:
            return <span>In progress</span>;
        case captureStatus.analyzing:
            return <span>Analyzing</span>;
        case captureStatus.completed:
            return <span>Capture complete</span>;
        case captureStatus.failed:
            return <span>Capture failed: {captureErrorMessage}</span>;
        default:
            return <span>Unknown</span>;
    }
};

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
            timer: null,
            captureStatus: captureStatus.noCapture,
            captureId: undefined,
            captureErrorMessage: undefined
        };

        this.startCapture = this.startCapture.bind(this);
        this.onSdpParsed = this.onSdpParsed.bind(this);
        this.onSdpValidated = this.onSdpValidated.bind(this);
        this.onPcapProcessingEnded = this.onPcapProcessingEnded.bind(this);
        this.onStreamsChanged = this.onStreamsChanged.bind(this);
        this.onCaptureFullNameChanged = this.onCaptureFullNameChanged.bind(this);
        this.onCaptureFullNameChanged = this.onCaptureFullNameChanged.bind(this);
        this.onCaptureDescriptionChanged = this.onCaptureDescriptionChanged.bind(this);
        this.updateNow = this.updateNow.bind(this);
        this.getFullName = this.getFullName.bind(this);
    }

    componentDidMount() {
        const timer = setInterval(this.updateNow, 500);
        this.setState({ timer });
        websocket.on(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
        websocket.on(websocketEventsEnum.LIVE.SDP_VALIDATION_RESULTS, this.onSdpValidated);
        websocket.on(websocketEventsEnum.PCAP.DONE, this.onPcapProcessingEnded);
        websocket.on(websocketEventsEnum.PCAP.FILE_FAILED, this.onPcapProcessingEnded);
    }

    componentWillUnmount() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }

        websocket.off(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
        websocket.off(websocketEventsEnum.LIVE.SDP_VALIDATION_RESULTS, this.onSdpValidated);
        websocket.off(websocketEventsEnum.PCAP.DONE, this.onPcapProcessingEnded);
        websocket.off(websocketEventsEnum.PCAP.FILE_FAILED, this.onPcapProcessingEnded);
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

    onPcapProcessingEnded(data) {
        const uuid = _.get(data, ['id']);
        if (uuid === this.state.captureId) {
            this.setState({ captureStatus: captureStatus.completed });
        }
    }

    startCapture() {
        const captureFullName = this.getFullName();
        if (captureFullName === '') {
            return;
        }

        const captureInfo = Object.assign({}, {
            streams: this.state.streams,
            duration: this.state.duration,
            name: captureFullName,
            capture_id: uuid()
        });

        this.setState(
            prevState => Object.assign({}, ...prevState, {
                captureStatus: captureStatus.inProgress,
                captureId: captureInfo.capture_id
            }),
            () => {
                api.subscribePCAP(captureInfo)
                    .then(() => {
                        this.setState({
                            captureStatus: captureStatus.analyzing
                        });
                    })
                    .catch((error) => {
                        const errorMessage = _.get(error, ['response', 'data', 'message'], '');

                        this.setState({
                            captureStatus: captureStatus.failed,
                            captureErrorMessage: errorMessage
                        });
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
                <div className="row lst-no-margin lst-align-items-baseline">
                    <div className="col-xs-10">
                        {getCaptureStatusMessage(this.state.captureStatus, this.state.captureErrorMessage)}
                    </div>
                    <div className="col-xs-2 lst-text-right end-xs">
                        <Button
                            type="info"
                            label={translate('workflow.start_capture')}
                            onClick={this.startCapture}
                            disabled={
                                this.state.captureStatus === captureStatus.inProgress 
                                || this.state.captureStatus === captureStatus.analyzing 
                                || this.getFullName() === ''}
                        />
                    </div>
                </div>
                <SdpStatus errors={this.state.sdpErrors} />
            </div>
        );
    }
}

export default CapturePanel;
