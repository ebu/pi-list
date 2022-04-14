import React from 'react';
import routeNames from './routeNames';
import DashboardContentHOC from '../pages/Dashboard/DashboardContentHOC';
import PCapDetailsContentHOC from '../pages/PCapDetails/PCapDetailsContentHOC';
import CaptureContentHOC from '../pages/Capture/CaptureContentHOC';
import ComparisonPageContentHOC from '../pages/StreamComparison/ComparisonPage/ComparisonPageContentHOC';
import DownloadManagerContentHOC from '../pages/DownloadManager/DownloadManagerContentHOC';
import StreamComparisonContentHOC from '../pages/StreamComparison/StreamComparisonContentHOC';
import SettingsHOC from '../pages/Settings/SettingsHOC';
import CreditsHOC from '../pages/Credits/CreditsHOC';

// name is used for translation as `routes.name.${e.name}`

const routeInfo: IRouteInfo[] = [
    {
        name: 'Analysis',
        path: routeNames.PCAPS,
        component: <DashboardContentHOC/>,
        exact: true,
    },
    {
        name: 'Pcap info',
        path: '/pcaps/:pcapID/streams/*',
        component: <PCapDetailsContentHOC/>,
        exact: false,
    },
    {
        name: 'Stream Comparison',
        path: routeNames.STREAM_COMPARISON,
        component: <StreamComparisonContentHOC/>,
        exact: true,
    },
    {
        name: 'Pcap Capture',
        path: routeNames.CAPTURE,
        component: <CaptureContentHOC/>,
        exact: true,
    },
    {
        name: 'Comparison View',
        path: '/streamComparison/:comparisonId',
        component: <ComparisonPageContentHOC/>,
        exact: false,
    },
    {
        name: 'Download Manager',
        path: routeNames.DOWNLOAD_MANAGER,
        component: <DownloadManagerContentHOC/>,
        exact: true,
    },
    {
        name: 'Credits',
        path: routeNames.CREDITS,
        component: <CreditsHOC/>,
        exact: true,
    },
    {
        name: 'Settings',
        path: routeNames.SETTINGS,
        component: <SettingsHOC/>,
        exact: true,
    },
];

export const getRouteInfoForPath = (path: string) => {
    if (!path) {
        return null;
    }
    const route = routeInfo.find(r => {
        if (r.exact) {
            return path === r.path;
        }

        const splitRoutePath = r.path?.split('/', 2);
        const routeBasePath = splitRoutePath?.join('/');

        return path.startsWith(routeBasePath);
    });
    return route;
};

export interface IRouteInfo {
    name: string;
    path: string;
    component?: React.ReactNode;
    exact: boolean;
    render?: () => JSX.Element;
}

export default routeInfo;
