import React, { Fragment } from 'react';
import { Switch, Route } from 'react-router-dom';
import Button from 'components/common/Button';
import routeNames from 'config/routeNames';
import api from 'utils/api';
import Badge from "./components/common/Badge";

const Header = (props) => {
    return (
        <Fragment>
            <h1 className="lst-header-title lst-no-margin">
                <span>{props.label}</span>
            </h1>
            <div className="col-xs end-xs">
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
                        filename={button.filename}
                        onClick={() => button.onClick()}
                    />
                ))}
            </div>
        </Fragment>
    );
};

const HEADER_FOR_PCAPS = {
    backButtonLabel: "Back"
};

export default (
    <Switch>
        <Route
            exact
            path={routeNames.DASHBOARD}
            render={() => (<Header label="Dashboard" />)}
        />
        <Route
            exact
            path={routeNames.PCAPS}
            render={() => (<Header label="PCAPs" />)}
        />
        <Route
            exact
            path={`${routeNames.PCAPS}/:pcapID/ptp`}
            render={props => (
                <Header
                    {...props}
                    label="PTP Analysis"
                    buttons={[
                        {
                            label: 'Back',
                            icon: 'keyboard backspace',
                            onClick: () => {
                                const { pcapID } = props.match.params;
                                props.history.push(`${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/`);
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
                <Header
                    {...props}
                    label="Streams"
                    buttons={[
                        {
                            label: 'Download SDP',
                            icon: 'file download',
                            downloadPath: api.downloadSDP(props.match.params.pcapID),
                            onClick: () => {}
                        },
                        {
                            label: 'Back',
                            icon: 'keyboard backspace',
                            onClick: () => {
                                const { pcapID } = props.match.params;
                                props.history.push(`${routeNames.PCAPS}/`);
                            }
                        }
                    ]}
                />)
            }
        />
        <Route
            exact
            path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID`}
            render={props => (
                <Header
                    {...props}
                    label="Stream"
                    backButtonLabel="Back to Streams"
                    buttons={[
                        {
                            label: 'Configure Stream',
                            icon: 'settings',
                            onClick: () => {
                                const { pcapID, streamID } = props.match.params;
                                props.history.push(`${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/${streamID}/${routeNames.CONFIGURE}`);
                            }
                        },
                        {
                            label: 'Back to Streams',
                            icon: 'keyboard backspace',
                            onClick: () => {
                                const { pcapID } = props.match.params;
                                props.history.push(`${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/`);
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
                    label="Configure Stream"
                    buttons={[
                        {
                            label: 'Back to Streams',
                            icon: 'keyboard backspace',
                            onClick: () => {
                                const { pcapID } = props.match.params;
                                props.history.push(`${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/`);
                            }
                        }
                    ]}

                />)
            }
        />
    </Switch>
);
