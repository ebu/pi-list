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
import CapturePage from './pages/CapturePage/index';
import WorkflowsPage from './pages/WorkflowsPage';
import ComparisonsPage from './pages/ComparisonsPage';
import StreamComparisonPage from './pages/StreamComparisonPage';

import FlowList from './containers/live/FlowList';
import ErrorPage from './components/ErrorPage';
import errorEnum from './enums/errorEnum';
import Panel from './components/common/Panel';
import Settings from './pages/Settings';
import CreditsPage from './pages/CreditsPage';
import { LiveRoute } from './utils/AppContext';

const DB = () => (<Redirect to={routeNames.PCAPS}  />);

export default (
    <Switch>
        <Route exact path={routeNames.HOME} component={DB} />
        <Route exact path={routeNames.SETTINGS} component={Settings} />
        <Route exact path={routeNames.CREDITS} component={CreditsPage} />
        <Route exact path={routeNames.PCAPS} component={PcapsPage} />
        <Route exact path={`${routeNames.PCAPS}/:pcapID/ptp`} component={PtpPage} />
        <Route exact path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}`} component={StreamList} />
        <Route exact path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID`} component={StreamPage} />
        <Route exact path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID/${routeNames.CONFIGURE}`} component={ConfigureStreamsPage} />
        <Route exact path={routeNames.STREAM_COMPARISONS} component={ComparisonsPage} />
        <Route exact path={`${routeNames.STREAM_COMPARISONS}/:comparisonID`} component={StreamComparisonPage} />
        <Route exact path={routeNames.WORKFLOWS} component={WorkflowsPage} />

        <LiveRoute exact path={routeNames.LIVE_SOURCES} component={CapturePage} />
        <LiveRoute exact path={routeNames.LIVE} component={LiveStreamList} />
        <LiveRoute
            exact
            path={routeNames.NETWORK}
            component={props => (
                <Panel className="col-xs-12 ">
                    <FlowList {...props} />
                </Panel>
            )}
        />
        <LiveRoute exact path={`${routeNames.LIVE}/${routeNames.STREAMS_PAGE}/:streamID/`} component={LiveStreamPage} />

        <Route render={() => (
            <ErrorPage
                errorType={errorEnum.PAGE_NOT_FOUND}
                errorMessageTag="errors.404_message"
            />
        )}
        />
    </Switch>
);
