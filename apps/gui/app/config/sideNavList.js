import routeNames from 'config/routeNames';
import { translate } from 'utils/translation';

export default [
    {
        link: routeNames.DASHBOARD,
        icon: 'home',
        label: translate('navigation.dashboard'),
        exact: true
    },
    {
        link: routeNames.LIVE,
        icon: 'fiber_manual_record',
        label: translate('navigation.live_streams'),
        exact: false,
        liveOnly: true
    },
    {
        link: routeNames.PCAPS,
        icon: 'dvr',
        label: translate('navigation.pcaps'),
        exact: false
    },
    {
        link: 'https://github.com/ebu/pi-list/issues',
        icon: 'help',
        label: translate('navigation.help'),
        external: true
    }
];
