import React from 'react';
import Sidebar, { Button, sidebarButtonsKeys } from 'components/Sidebar/Sidebar';
import {
    ComparisonIcon,
    AnalysisIcon,
    DownloadManagerIcon,
    CreditsIcon,
    HelpIcon,
    SettingsIcon,
    CollapseIcon,
} from 'components/icons/index';
import routeNames from '../../routes/routeNames';
import { getRouteInfoForPath } from '../../routes/routeInfo';
import { useLocation, useHistory } from 'react-router-dom';
import { translate } from '../../utils/translation';
import { useRecoilState } from 'recoil';
import { sidebarCollapsedAtom } from '../../store/gui/sidebar/sidebarCollapsed';
import list from 'utils/api';
import { IVersion } from '../../../../../../../third_party/ebu-list-sdk/lib/dist/types';

type ButtonList = Array<Button & { route: string }>;

interface IButtonWithRoutes {
    upperButtons: ButtonList;
    lowerButtons: ButtonList;
}

function SidebarHOC() {
    const location = useLocation();
    const routeInfo = getRouteInfoForPath(location.pathname);
    const routeBasePath = routeInfo && routeInfo.path;
    const history = useHistory();

    const [sidebarCollapsed, setSidebarCollapsed] = useRecoilState(sidebarCollapsedAtom);

    const [version, setVersion] = React.useState<IVersion>();

    React.useEffect(() => {
        const getVersion = async (): Promise<void> => {
            const version = await list.info.getVersion();
            setVersion(version);
        };

        getVersion();
    }, []);

    let buttonsList: IButtonWithRoutes = {
        upperButtons: [
            {
                text: translate('media_information.analysis'),
                clicked: false,
                key: sidebarButtonsKeys.analysis,
                icon: AnalysisIcon,
                route: routeNames.PCAPS,
            },
            {
                text: translate('navigation.stream_comparisons'),
                clicked: false,
                key: sidebarButtonsKeys.streamComparison,
                icon: ComparisonIcon,
                route: routeNames.STREAM_COMPARISON,
            },
            {
                text: translate('navigation.download_manager'),
                clicked: false,
                key: sidebarButtonsKeys.downloadManager,
                icon: DownloadManagerIcon,
                route: routeNames.DOWNLOAD_MANAGER,
            },
        ],
        lowerButtons: [
            {
                text: translate('navigation.settings'),
                clicked: false,
                key: sidebarButtonsKeys.settings,
                icon: SettingsIcon,
                route: routeNames.SETTINGS,
            },
            {
                text: translate('navigation.credits'),
                clicked: false,
                key: sidebarButtonsKeys.credits,
                icon: CreditsIcon,
                route: routeNames.CREDITS,
            },
            {
                text: translate('navigation.help'),
                clicked: false,
                key: sidebarButtonsKeys.help,
                icon: HelpIcon,
                route: 'ola',
            },
            {
                text: 'Collapse',
                clicked: false,
                key: sidebarButtonsKeys.collapse,
                icon: CollapseIcon,
                route: 'ola',
            },
            {
                text: `v${version?.major}.${version?.minor}.${version?.patch} @${version?.hash}`,
                clicked: false,
                key: sidebarButtonsKeys.version,
                route: 'ola',
            },
        ],
    };

    if ( (typeof(process.env.REACT_APP_LIVE) !== 'undefined') &&
         (process.env.REACT_APP_LIVE)) {
        buttonsList.upperButtons.splice(1, 0, {
            text: translate('navigation.capture'),
            clicked: false,
            key: sidebarButtonsKeys.capture,
            icon: ComparisonIcon,
            route: routeNames.CAPTURE,
        });
    }

    const helpString = translate('navigation.help');
    const onSidebarClick = (buttonKey: number): void => {
        let path: string | undefined | null = '';
        switch (buttonKey) {
            case sidebarButtonsKeys.analysis:
                path = routeNames.PCAPS;
                break;
            case sidebarButtonsKeys.capture:
                path = routeNames.CAPTURE;
                break;
            case sidebarButtonsKeys.streamComparison:
                path = routeNames.STREAM_COMPARISON;
                break;
            case sidebarButtonsKeys.downloadManager:
                path = routeNames.DOWNLOAD_MANAGER;
                break;
            case sidebarButtonsKeys.credits:
                path = routeNames.CREDITS;
                break;
            case sidebarButtonsKeys.collapse:
                setSidebarCollapsed(!sidebarCollapsed);
                path = location.pathname;
                break;
            case sidebarButtonsKeys.settings:
                path = routeNames.SETTINGS;
                break;
            case helpString:
                const win = window.open('https://github.com/ebu/pi-list/issues', '_blank');
                win?.focus();
                routeBasePath ? (path = routeBasePath) : (path = '/');
                break;
            case sidebarButtonsKeys.version:
                path = location.pathname;
                break;
            default:
                path = '/';
                break;
        }
        history.push(path);
    };
    const mapButtons = (bnt: ButtonList): ButtonList =>
        bnt.map(item => ({
            ...item,
            clicked: routeBasePath === item.route,
        }));

    const buttonsWithRoute = {
        upperButtons: mapButtons(buttonsList.upperButtons),
        lowerButtons: mapButtons(buttonsList.lowerButtons),
    };

    return (
        <div>
            <Sidebar state={buttonsWithRoute} onClick={onSidebarClick} isCollapsed={sidebarCollapsed} />
        </div>
    );
}

export default SidebarHOC;
