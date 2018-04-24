import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routeNames from 'config/routeNames';
import Dashboard from 'pages/Dashboard';
import StreamPage from 'pages/StreamPage';
import PcapList from 'containers/PcapList';
import StreamList from "pages/StreamList";
import ConfigureStreamsPage from 'pages/ConfigureStreams';
import PcapPage from 'pages/PcapPage';
import ErrorPage from 'components/ErrorPage';
import errorEnum from 'enums/errorEnum';
import Panel from 'components/common/Panel';

export default (
    <Switch>
        <Route exact path={routeNames.DASHBOARD} component={Dashboard} />
        <Route exact path={routeNames.PCAPS} component={(props) => (
            <Panel className="col-xs-12 ">
                <PcapList {...props}/>
            </Panel>
        )} />
        <Route path={`${routeNames.PCAPS}/:pcapID/ptp`} component={PcapPage} exact/>
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}`} component={StreamList} exact/>
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID`} component={StreamPage} exact />
        <Route path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID/${routeNames.CONFIGURE}`} component={ConfigureStreamsPage} exact />
        <Route render={() => (
            <ErrorPage
                errorType={errorEnum.PAGE_NOT_FOUND}
                errorMessage="The page you are looking for doesn't exist or another error occurred."
            />
        )}
        />
    </Switch>
);
