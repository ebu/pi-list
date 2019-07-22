import React, { Fragment, Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Button from 'components/common/Button';
import RealTimeDataStatus from 'containers/live/RealTimeDataStatus';
import routeNames from './config/routeNames';
import api from 'utils/api';
import { T } from 'utils/translation';
import { LiveRoute } from 'utils/AppContext';
import routeBuilder from 'utils/routeBuilder';
import PcapFileNameHeader from './components/PcapFileNameHeader';


const Header = (props) => (
    <Fragment>
        <h1 className="lst-no-margin">
            <div style={{ display: 'flex' }}>
                <span className="lst-header-title"><T t={props.labelTag} /></span>
                <span>{props.item}</span>
            </div>
        </h1>
        <div className="col-xs end-xs">
            {props.children}
            {props.buttons && props.buttons.map(button => {
                const buttonLabel = (<T t={button.labelTag} />);

                return (
                    <Button
                        key={button.labelTag}
                        className="lst-header-button"
                        label={buttonLabel}
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
                );
            })}
        </div>
    </Fragment>
);

export default (
    <Switch>
        <Route
            exact
            path={routeNames.PCAPS}
            render={() => (<Header labelTag="navigation.pcaps" />)}
        />
        <Route
            exact
            path={routeNames.WORKFLOWS}
            render={() => (<Header labelTag="navigation.workflows" />)}
        />
        <Route
            exact
            path={routeNames.LIVE_SOURCES}
            render={() => (<Header labelTag="navigation.live_sources" />)}
        />
        <Route
            exact
            path={routeNames.SETTINGS}
            render={() => (<Header labelTag="navigation.settings" />)}
        />
        <Route
            exact
            path={routeNames.CAPTURE}
            render={() => (<Header labelTag="workflow.capture_stream" />)}
        />
        <LiveRoute
            path={routeNames.LIVE}
            hideOnFalse
            render={() => (
                <Header labelTag="navigation.live_streams">
                    <RealTimeDataStatus />
                </Header>
            )}
        />
        <LiveRoute
            path={routeNames.NETWORK}
            hideOnFalse
            render={() => (
                <Header labelTag="navigation.network">
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
                    labelTag="navigation.ptp_analysis"
                    buttons={[
                        {
                            labelTag: "buttons.go_back",
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
                        labelTag="navigation.streams"
                        buttons={[
                            {
                                labelTag: "pcap.download_pcap",
                                icon: 'file download',
                                downloadPath: api.downloadPcapUrl(props.match.params.pcapID),
                                onClick: () => { }
                            },
                            {
                                labelTag: "pcap.download_sdp",
                                icon: 'file download',
                                downloadPath: api.downloadSDPUrl(props.match.params.pcapID),
                                onClick: () => { }
                            },
                            {
                                labelTag: "buttons.go_back",
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
                    labelTag="navigation.stream"
                    buttons={[
                        {
                            labelTag: "stream.configure_streams",
                            icon: 'settings',
                            onClick: () => {
                                const { pcapID, streamID } = props.match.params;
                                props.history.push(routeBuilder.stream_config_page(pcapID, streamID));
                            }
                        },
                        {
                            labelTag: "buttons.go_back",
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
                    labelTag="stream.configure_streams"
                    buttons={[
                        {
                            labelTag: "buttons.go_back",
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
