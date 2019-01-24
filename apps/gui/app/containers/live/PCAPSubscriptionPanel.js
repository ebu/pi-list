import React, { Component } from 'react';
import Panel from 'components/common/Panel';
import Button from 'components/common/Button';
import { translate } from 'utils/translation';
import api from 'utils/api';
import notifications from 'utils/notifications';
import Input from 'components/common/Input';
import FormInput from 'components/common/FormInput';

class PCAPSubscriptionPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            source: '',
            destination_address: '',
            destination_port: 3000,
            duration: 500,
            name: Date.now()
        };

        this.subscribe = this.subscribe.bind(this);
    }

    subscribe() {
        api.subscribePCAP(this.state)
            .then(() => {
                notifications.success({
                    title: translate('notifications.success.stream_analysis'),
                    message: translate('notifications.success.stream_analysis_message')
                });
            })
            .catch((error) => {
                notifications.error({
                    title: translate('notifications.error.stream_analysis'),
                    message: translate('notifications.error.stream_analysis_message')
                });
            });
    }

    render() {
        return (
            <Panel noBorder noPadding>
                <div className="lst-sdp-config lst-no-margin">
                    <FormInput label={translate('media_information.rtp.source')}>
                        <Input
                            noFullWidth
                            type="text"
                            placeholder="224.10.10.1"
                            value={this.state.source}
                            onChange={evt => this.setState({ source: evt.target.value })}
                        />
                    </FormInput>
                    <FormInput label={translate('media_information.rtp.destination')}>
                        <Input
                            noFullWidth
                            type="text"
                            placeholder="224.10.10.1"
                            value={this.state.destination_address}
                            onChange={evt => this.setState({ destination_address: evt.target.value })}
                        />
                        <Input
                            noFullWidth
                            type="number"
                            value={this.state.destination_port}
                            placeholder={this.state.destination_port}
                            min="0"
                            max="60000"
                            onChange={evt => this.setState({ destination_port: parseInt(evt.currentTarget.value, 10) })}
                        />
                    </FormInput>
                    <FormInput label={translate('media_information.rtp.duration')}>
                        <Input
                            noFullWidth
                            type="number"
                            min="0"
                            value={this.state.duration}
                            onChange={evt => this.setState({ duration: parseInt(evt.currentTarget.value, 10) })}
                        /> <span>ms</span>
                    </FormInput>
                    <FormInput label="Display Name">
                        <Input
                            noFullWidth
                            type="text"
                            value={this.state.name}
                            onChange={evt => this.setState({ name: evt.target.value })}
                        />
                    </FormInput>

                </div>
                <div className="row end-xs lst-text-right lst-no-margin">
                    <Button
                        type="info"
                        label={translate('stream.analyze_stream')}
                        onClick={this.subscribe}
                    />
                </div>
            </Panel>
        );
    }
}

export default PCAPSubscriptionPanel;
