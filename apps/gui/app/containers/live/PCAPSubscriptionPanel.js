import React, { Component } from 'react';
import Panel from 'components/common/Panel';
import Button from 'components/common/Button';
import { translate } from 'utils/translation';
import api from 'utils/api';
import notifications from 'utils/notifications';
import Input from 'components/common/Input';
import FormInput from 'components/common/FormInput';
import websocket from 'utils/websocket';
import websocketEventsEnum from 'enums/websocketEventsEnum';

class PCAPSubscriptionPanel extends Component {
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

        this.subscribe = this.subscribe.bind(this);
        this.onSdpParsed = this.onSdpParsed.bind(this);
        this.renderStreamEntry = this.renderStreamEntry.bind(this);
    }

    onSdpParsed(data) {
        this.setState({
            name: data.description,
            stream: data.streams.map(str => {
               return { src: str.src, dstAddr: str.dstAddr, dstPort: str.dstPort };
            })
        });
    }

    componentDidMount() {
        websocket.on(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.LIVE.IP_PARSED_FROM_SDP, this.onSdpParsed);
    }


    subscribe() {
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

    renderStreamEntry(stream, index) {
        return (
            <div className="lst-sdp-config lst-no-margin">
                <FormInput label={ translate('media_information.rtp.stream') + ' ' + index }>
                <Input
                        noFullWidth
                        type="text"
                        placeholder="Multicast group @"
                        value={ stream.dstAddr }
                        onChange={
                            evt => {
                                const str = this.state.stream;
                                str[index].dstAddr = evt.target.value;
                                this.setState({ stream: str });
                            }
                        }
                    />
                    <Input
                        noFullWidth
                        type="text"
                        placeholder="Port"
                        value={ stream.dstPort }
                        onChange={
                            evt => {
                                const str = this.state.stream;
                                str[index].dstPort = evt.target.value;
                                this.setState({ stream: str });
                            }
                        }
                    />
                </FormInput>
            </div>
        )
    }

    render() {
        return (
            <Panel noBorder noPadding>
                { this.state.stream.map((stream, index) => this.renderStreamEntry(stream, index)) }
                <div className="row center-xs">
                    <Button
                        type="info"
                        label={ translate('workflow.add_stream') }
                        onClick={() => {
                                const str = this.state.stream;
                                str.push({ src:'', dstAddr: '', dstPort: '' });
                                this.setState({ stream: str });
                            }
                        }
                    />
                </div>
                <div className="lst-sdp-config lst-no-margin">
                    <FormInput label={ translate('media_information.rtp.duration') }>
                        <Input
                            noFullWidth
                            type="number"
                            min="0"
                            value={ this.state.duration }
                            onChange={evt => this.setState({ duration: parseInt(evt.currentTarget.value, 10) })}
                        /> <span>ms</span>
                    </FormInput>
                    <FormInput label="Capture Name">
                        <Input
                            noFullWidth
                            type="text"
                            value={ this.state.name }
                            onChange={evt => this.setState({ name: evt.target.value })}
                        />
                    </FormInput>

                </div>
                <div className="row end-xs lst-text-right lst-no-margin">
                    <Button
                        type="info"
                        label={ translate('workflow.start_capture') }
                        onClick={ this.subscribe }
                        disabled={ this.state.capturing }
                    />
                </div>
            </Panel>
        );
    }
}

export default PCAPSubscriptionPanel;
