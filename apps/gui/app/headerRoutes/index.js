import React, { Fragment, Component } from "react";
import { Switch, Route } from "react-router-dom";
import RealTimeDataStatus from "containers/live/RealTimeDataStatus";
import routeNames from "../config/routeNames";
import { LiveRoute } from "utils/AppContext";
import routeBuilder from "utils/routeBuilder";
import Header from "./Header";
import PcapFileNameHeader from "../components/PcapFileNameHeader";
import PcapPageHeader from "./PcapPageHeader";
import StreamPageHeader from "./StreamPageHeader";
import ConfigureStreamHeader from "./ConfigureStreamHeader";
import PtpPageHeader from "./PtpPageHeader";
import PcapListHeader from "./PcapListHeader";
import ComparisonPageHeader from "./ComparisonPageHeader";

export default (
  <Switch>
    <Route exact path={routeNames.PCAPS} render={() => <PcapListHeader />} />
    <Route
      exact
      path={routeNames.WORKFLOWS}
      render={() => <Header labelTag="navigation.workflows" />}
    />
    <Route
      exact
      path={routeNames.CAPTURE}
      render={() => <Header labelTag="navigation.capture" />}
    />
    <Route
      exact
      path={routeNames.SETTINGS}
      render={() => <Header labelTag="navigation.settings" />}
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
        <PtpPageHeader {...props} pcapID={props.match.params.pcapID} />
      )}
    />
    <Route
      exact
      path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}`}
      render={props => (
        <PcapPageHeader {...props} pcapID={props.match.params.pcapID} />
      )}
    />
    <Route
      exact
      path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID/${routeNames.CONFIGURE}`}
      render={props => (
        <ConfigureStreamHeader {...props} pcapID={props.match.params.pcapID} />
      )}
    />
    <Route
      path={`${routeNames.PCAPS}/:pcapID/${routeNames.STREAMS_PAGE}/:streamID`}
      render={props => (
        <StreamPageHeader
          {...props}
          pcapID={props.match.params.pcapID}
          streamID={props.match.params.streamID}
        />
      )}
    />
    <Route
      exact
      path={`${routeNames.STREAM_COMPARISONS}/:comparisonID`}
      render={props => (
        <ComparisonPageHeader {...props} />
      )}
    />
    <Route
      exact
      path={`${routeNames.STREAM_COMPARISONS}/:comparisonID`}
      render={props => (
        <ComparisonPageHeader {...props} />
      )}
    />
  </Switch>
);
