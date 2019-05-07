import React, { Fragment, Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Button from 'components/common/Button';
import RealTimeDataStatus from 'containers/live/RealTimeDataStatus';
import routeNames from 'config/routeNames';
import api from 'utils/api';
import { pluralize, translate } from 'utils/translation';
import { LiveRoute } from 'utils/liveFeature';
import routeBuilder from 'utils/routeBuilder';
import PcapFileNameHeader from './components/PcapFileNameHeader';


const Header = (props) => {
    return (
        <Fragment>
            <h1 className="lst-no-margin">
                <div style={{ display: 'flex' }}>
                    <span className="lst-header-title">{props.label}</span>
                    <span>{props.item}</span>
                </div>
            </h1>
            <div className="col-xs end-xs">
                {props.children}
                {props.buttons && props.buttons.map(button => (
                    <Button
                        key={button.label}
                        className="lst-header-button"
                        label={button.label}
                        type="info"
                        icon={button.icon}
                        outline
                        noMargin
                        noAnimation
                        downloadPath={button.downloadPath}
                        externalPath={button.externalPath}
                        filename={button.filename}
                        onClick={() => button.onClick()}
                    />
                ))}
            </div>
        </Fragment>
    );
};

export default (
    <Switch>
        <Route
            exact
            path={routeNames.PCAPS}
            render={() => (<Header label={translate('navigation.pcaps')} />)}
        />
        <LiveRoute
            path={routeNames.LIVE}
            hideOnFalse
            render={() => (
                <Header label={translate('navigation.live_streams')}>
                    <RealTimeDataStatus />
                </Header>
            )}
        />
        <LiveRoute
            path={routeNames.NETWORK}
            hideOnFalse
            render={() => (
                <Header label={translate('navigation.network')}>
                    <RealTimeDataStatus />
                </Header>
            )}
        />
        <Route
            exact
            path={`${routeNames.PCAPS}/:pcapID/ptp`}
            render={props => (
                <Header
                    {...props}
                    item={<PcapFileNameHeader {...props} />}
                    label="PTP Analysis"
                    buttons={[
                        {
                            label: translate('buttons.go_back'),
                            icon: 'keyboard backspace',
                            onClick: () => {
                                const { pcapID } = props.match.params;
                                props.history.push(routeBuilder.pcap_stream_list(pcapID));
                            }
                        }
                    ]}
                />)
            }
        />
        <Route
            exact
            path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}`}
            render={props => (
                <React.Fragment>
                    <Header
                        {...props}
                        item={<PcapFileNameHeader {...props} />}
                        label="Streams"
                        buttons={[
                            {
                                label: translate('pcap.download_pcap'),
                                icon: 'file download',
                                downloadPath: api.downloadPcapUrl(props.match.params.pcapID),
                                onClick: () => { }
                            },
                            {
                                label: translate('pcap.download_sdp'),
                                icon: 'file download',
                                downloadPath: api.downloadSDPUrl(props.match.params.pcapID),
                                onClick: () => { }
                            },
                            {
                                label: translate('buttons.go_back'),
                                icon: 'keyboard backspace',
                                onClick: () => {
                                    props.history.push(routeBuilder.pcap_list());
                                }
                            }
                        ]}
                    />
                </React.Fragment>
            )}
        />
        <Route
            exact
            path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID`}
            render={props => (
                <Header
                    {...props}
                    item={<PcapFileNameHeader {...props} />}
                    label="Stream"
                    buttons={[
                        {
                            label: pluralize('stream.configure_streams', 1),
                            icon: 'settings',
                            onClick: () => {
                                const { pcapID, streamID } = props.match.params;
                                props.history.push(routeBuilder.stream_config_page(pcapID, streamID));
                            }
                        },
                        {
                            label: translate('buttons.go_back'),
                            icon: 'keyboard backspace',
                            onClick: () => {
                                const { pcapID } = props.match.params;
                                props.history.push(routeBuilder.pcap_stream_list(pcapID));
                            }
                        }
                    ]}
                />)
            }
        />
        <Route
            exact
            path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID/${routeNames.CONFIGURE}`}
            render={props => (
                <Header
                    {...props}
                    item={<PcapFileNameHeader {...props} />}
                    label={pluralize('stream.configure_streams', 1)}
                    buttons={[
                        {
                            label: translate('buttons.go_back'),
                            icon: 'keyboard backspace',
                            onClick: () => {
                                const { pcapID } = props.match.params;
                                props.history.push(routeBuilder.pcap_stream_list(pcapID));
                            }
                        }
                    ]}

                />)
            }
        />
    </Switch>
);
