import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routeNames from 'config/routeNames';

import StreamList from 'pages/StreamList';
import ConfigureStreamsPage from 'pages/ConfigureStreams';
import PtpPage from 'pages/PtpPage';
import LiveStreamList from 'pages/LiveStreamList';
import Dashboard from 'pages/Dashboard';
import StreamPage from 'pages/StreamPage';
import LiveStreamPage from 'pages/LiveStreamPage';
import FlowList from 'containers/live/FlowList';

import ErrorPage from 'components/ErrorPage';
import PcapList from 'containers/PcapList';
import errorEnum from 'enums/errorEnum';
import Panel from 'components/common/Panel';
import { translate } from 'utils/translation';
import { LiveRoute } from 'utils/liveFeature';

export default (
    <Switch>
        <Route exact path={routeNames.DASHBOARD} component={Dashboard} />
        <Route
            exact
            path={routeNames.PCAPS}
            component={props => (
                <Panel className="col-xs-12 ">
                    <PcapList {...props} />
                </Panel>
            )}
        />
        <Route path={`${routeNames.PCAPS}/:pcapID/ptp`} component={PtpPage} exact />
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}`} component={StreamList} exact />
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID`} component={StreamPage} exact />
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID/${routeNames.CONFIGURE}`} component={ConfigureStreamsPage} exact />

        <LiveRoute path={routeNames.LIVE} component={LiveStreamList} exact />
        <LiveRoute
            path={routeNames.NETWORK}
            exact
            component={props => (
                <Panel className="col-xs-12 ">
                    <FlowList {...props} />
                </Panel>
            )}
        />
        <LiveRoute path={`${routeNames.LIVE}/${routeNames.STREAMS_PAGE}/:streamID/`} component={LiveStreamPage} exact />

        <Route render={() => (
            <ErrorPage
                errorType={errorEnum.PAGE_NOT_FOUND}
                errorMessage={translate('errors.404_message')}
            />
        )}
        />
    </Switch>
);
