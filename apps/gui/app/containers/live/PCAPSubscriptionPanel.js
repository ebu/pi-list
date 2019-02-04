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
            destination_port: 0,
            duration: 1000,
            name: Date.now(),
            capturing: false
        };

        this.subscribe = this.subscribe.bind(this);
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

    render() {
        return (
            <Panel noBorder noPadding>
                <div className="lst-sdp-config lst-no-margin">
                    <FormInput label={translate('media_information.rtp.source')}>
                        <Input
                            noFullWidth
                            type="text"
                            placeholder="Source IP address"
                            value={this.state.source}
                            onChange={evt => this.setState({ source: evt.target.value })}
                        />
                    </FormInput>
                    <FormInput label={translate('media_information.rtp.destination')}>
                        <Input
                            noFullWidth
                            type="text"
                            placeholder="Multicast group"
                            value={this.state.destination_address}
                            onChange={evt => this.setState({ destination_address: evt.target.value })}
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
                        label={translate('workflow.start_capture')}
                        onClick={this.subscribe}
                        disabled={this.state.capturing}
                    />
                </div>
            </Panel>
        );
    }
}

export default PCAPSubscriptionPanel;
