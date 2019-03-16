import routeNames from 'config/routeNames';
import { translate } from 'utils/translation';

export default [
    {
        link: routeNames.PCAPS,
        icon: 'dvr',
        label: translate('navigation.pcaps'),
        exact: false
    },
    {
        link: routeNames.CAPTURE,
        icon: 'fiber_manual_record',
        label: translate('navigation.capture'),
        exact: false,
        liveOnly: true
    },
    // {
    //     link: routeNames.LIVE,
    //     icon: 'settings_input_antenna',
    //     label: translate('navigation.live_streams'),
    //     exact: false,
    //     liveOnly: true
    // },
    // {
    //     link: routeNames.NETWORK,
    //     icon: 'wifi_tethering',
    //     label: translate('navigation.network'),
    //     exact: true,
    //     liveOnly: true
    // }
];
