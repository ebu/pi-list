import React from 'react';
import { Routes, Route } from 'react-router-dom';
import routeInfo, { IRouteInfo } from './routeInfo';
import routeNames from './routeNames';

const routeFor = (e: IRouteInfo, index: number): JSX.Element => {
    return <Route key={index} path={e.path} element={e.component}/>;
};

export default (
    <Routes>
        <Route path={routeNames.HOME}>
        {routeInfo.map((e, index) => routeFor(e, index))}
        </Route>
        <Route element={<h1>ERROR</h1>} />
    </Routes>
);
