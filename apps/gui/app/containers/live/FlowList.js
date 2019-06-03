import React, { Component } from 'react';
import api from 'utils/api';
import websocket from 'utils/websocket';
import websocketEventsEnum from 'enums/websocketEventsEnum';
import Icon from 'components/common/Icon';

class DevicesList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            streams: []
        };

        this.onStreamUpdate = this.onStreamUpdate.bind(this);
        this.onActionButton = this.onActionButton.bind(this);
    }

    componentDidMount() {
        websocket.on(websocketEventsEnum.LIVE.NMOS_UPDATE, this.onStreamUpdate);
    }

    componentWillUnmount() {
        websocket.off(websocketEventsEnum.LIVE.NMOS_UPDATE, this.onStreamUpdate);
    }

    onStreamUpdate(data) {
        this.setState({ streams: data });
    }

    onActionButton(item) {
        api.subscribeLiveStream(item)
            .then(() => {
                // todo: don't depend on 'window' variable. use router
                // todo: redirect to the live stream page instead of the generic /live page
                window.appHistory.push('/live');
            })
            .catch((error) => {
                console.log(error);
                // todo: handle error via a notification
            });
    }

    renderIcon(rowData) {
        let iconValue;
        switch (rowData.format) {
        case 'urn:x-nmos:format:video':
            iconValue = 'videocam';
            break;
        case 'urn:x-nmos:format:audio':
            iconValue = 'audiotrack';
            break;
        case 'urn:x-nmos:format:data':
        default:
            iconValue = 'help';
            break;
        }
        return (
            <span className="stream-type-number">
                <Icon value={iconValue} />
            </span>
        );
    }

    render() {
        return (
            <React.Fragment>
                {/* <Table
                    data={this.state.streams}
                    noItemsMessage={translateC('flow.no_flows')}
                    rows={[
                        {
                            key: 'icon',
                            header: '',
                            render: this.renderIcon,
                            width: '2%'
                        },
                        {
                            key: 'label',
                            header: 'Flow',
                            width: '30%'
                        },
                        {
                            key: item => item.source.label,
                            header: 'Source',
                            width: '30%'
                        },
                        {
                            key: item => item.device.label,
                            header: 'Device',
                            width: '30%'
                        }
                    ]}
                    fixed
                    showFirstElements={this.props.limit}
                    action={{
                        icon: 'play_arrow',
                        type: 'success',
                        onClick: item => this.onActionButton(item)
                    }}
                /> */}
            </React.Fragment>
        );
    }
}

export default DevicesList;
