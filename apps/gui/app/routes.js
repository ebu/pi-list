import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import routeNames from './config/routeNames';
import StreamList from './pages/StreamList';
import ConfigureStreamsPage from './pages/ConfigureStreams';
import PtpPage from './pages/PtpPage';
import LiveStreamList from './pages/LiveStreamList';
import StreamPage from './pages/StreamPage';
import LiveStreamPage from './pages/LiveStreamPage';
import PcapsPage from './pages/PcapsPage';
import CapturePage from './pages/CapturePage';
import LiveSourcesPage from './pages/LiveSourcesPage';
import WorkflowsPage from './pages/WorkflowsPage';

import FlowList from './containers/live/FlowList';
import ErrorPage from './components/ErrorPage';
import errorEnum from './enums/errorEnum';
import Panel from './components/common/Panel';
import Settings from './pages/Settings';
import { LiveRoute } from './utils/AppContext';

const DB = () => (<Redirect to={routeNames.PCAPS}  />);

export default (
    <Switch>
        <Route exact path={routeNames.HOME} component={DB} />
        <Route exact path={routeNames.SETTINGS} component={Settings} />
        <Route exact path={routeNames.PCAPS} component={PcapsPage} />
        <Route exact path={routeNames.CAPTURE} component={CapturePage} />
        <Route path={`${routeNames.PCAPS}/:pcapID/ptp`} component={PtpPage} exact />
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}`} component={StreamList} exact />
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID`} component={StreamPage} exact />
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID/${routeNames.CONFIGURE}`} component={ConfigureStreamsPage} exact />
        <LiveRoute exact path={routeNames.LIVE_SOURCES} component={LiveSourcesPage} />
        <LiveRoute exact path={routeNames.WORKFLOWS} component={WorkflowsPage} />
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
                errorMessageTag="errors.404_message"
            />
        )}
        />
    </Switch>
);
