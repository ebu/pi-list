import React from 'react';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import routeInfo, { IRouteInfo } from './routeInfo';
import routeNames from './routeNames';

const routeFor = (e: IRouteInfo, index: number): JSX.Element => {
    return <Route key={index} exact={e.exact} path={e.path} component={e.component} render={e.render} />;
};

export default (
    <Switch>
        <Route exact path={routeNames.HOME}>
            <Redirect to={routeNames.PCAPS} />
        </Route>
        {routeInfo.map((e, index) => routeFor(e, index))}
        <Route render={() => <h1>ERROR</h1>} />
    </Switch>
);
