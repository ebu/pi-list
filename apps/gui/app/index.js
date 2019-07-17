import "core-js/stable";
import "regenerator-runtime/runtime";

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from 'containers/App';
import Login from 'pages/Login';

import 'style/index.scss';

render(
    <BrowserRouter>
        <Switch>
            <Route
                path="/login"
                component={Login}
            />
            <Route
                path="/"
                component={(props) => {
                    window.appHistory = props.history;

                    return (<App {...props} />);
                }}
            />
        </Switch>
    </BrowserRouter>,
    document.getElementById('lst-app'),
);
