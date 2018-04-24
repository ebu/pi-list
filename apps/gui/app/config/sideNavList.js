import routeNames from 'config/routeNames';

export default [
    {
        link: routeNames.DASHBOARD,
        icon: 'home',
        label: 'Dashboard',
        exact: true
    },
    {
        link: routeNames.PCAPS,
        icon: 'dvr',
        label: 'PCAPs & Streams',
        exact: false
    }
];
