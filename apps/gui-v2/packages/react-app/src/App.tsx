import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import MainPage from './pages/Common/MainPage';
import Login from './pages/Login';
import Logout from './pages/Logout';
import routeNames from './routes/routeNames';
import './styles.scss';
import { RecoilRoot } from 'recoil';
import ReactGA from 'react-ga';

const App = (): React.ReactElement => {
    // ReactGA.initialize('UA-183941332-1');
    return (
        <RecoilRoot>
            <BrowserRouter>
                <Routes>
                    <Route path={routeNames.LOGIN} element={<Login />} />
                    <Route path={routeNames.LOGOUT} element={<Logout />} />
                    <Route path="*" element={<MainPage />} />
                </Routes>
            </BrowserRouter>
        </RecoilRoot>
    );
};

export default App;
