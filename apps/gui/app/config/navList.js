import routeNames from './routeNames';

export default {
    top: [
        {
            link: routeNames.HOME,
            icon: 'home',
            labelTag: 'navigation.home',
            exact: false,
        },
        {
            link: routeNames.PCAPS,
            icon: 'playlist add check',
            labelTag: 'navigation.pcaps',
            exact: false,
        },
        {
            link: routeNames.CAPTURE,
            icon: 'fiber_manual_record',
            labelTag: 'navigation.capture',
            exact: false,
            liveOnly: true,
        },
        {
            link: routeNames.LIVE,
            icon: 'live_tv',
            labelTag: 'navigation.live_streams',
            exact: false,
            liveOnly: true,
        },
        {
            link: routeNames.STREAM_COMPARISONS,
            icon: 'compare',
            labelTag: 'navigation.stream_comparisons',
            exact: false,
        },
        {
            link: routeNames.DOWNLOAD_MANAGER,
            icon: 'archive',
            labelTag: 'navigation.download_manager',
            exact: false,
        },
        {
            link: routeNames.WORKFLOWS,
            icon: 'playlist play',
            labelTag: 'navigation.workflows',
            exact: false,
        },
        // {
        //     link: routeNames.NETWORK,
        //     icon: 'wifi_tethering',
        //     labelTag: 'navigation.network',
        //     exact: true,
        //     liveOnly: true
        // },
        {
            link: routeNames.SETTINGS,
            icon: 'settings',
            labelTag: 'navigation.settings',
            exact: false,
            liveOnly: false,
        },
    ],
    bottom: [
        {
            link: routeNames.CREDITS,
            icon: 'favorite_border',
            labelTag: 'navigation.credits',
            exact: false,
            liveOnly: false,
        },
    ],
};
