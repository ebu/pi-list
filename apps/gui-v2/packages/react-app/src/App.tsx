import React, { ReactElement } from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import MainPage from './pages/Common/MainPage';
import Login from './pages/Login';
import Logout from './pages/Logout';
import routeNames from './routes/routeNames';
import './styles.scss';
import { RecoilRoot } from 'recoil';
import ReactGA from 'react-ga4';

const App = (): ReactElement => {
    ReactGA.initialize('G-4VD9154HGG');
    return (
        <RecoilRoot>
            <BrowserRouter>
                <Switch>
                    <Route path={routeNames.LOGIN} exact component={Login} />
                    <Route path={'/logout'} exact component={Logout} />
                    <Route path="/" component={MainPage} />
                </Switch>
            </BrowserRouter>
        </RecoilRoot>
    );
};

export default App;
