import React from 'react';
import Sidebar, { IButton, sidebarButtonsKeys } from './Sidebar';
import { ComparisonIcon, AnalysisIcon, DownloadManagerIcon, CreditsIcon, HelpIcon } from '../icons/index';
import { translate } from '../../utils/translation';

interface ComponentProps {
    isCollapsed: boolean;
    currentRoute: string | undefined;
}

function SidebarHOC({ isCollapsed, currentRoute }: ComponentProps) {
    const buttonsList: IButton = {
        upperButtons: [
            {
                text: translate('media_information.analysis'),
                clicked: false,
                key: sidebarButtonsKeys.analysis,
                icon: AnalysisIcon,
            },
            {
                text: translate('navigation.stream_comparisons'),
                clicked: false,
                key: sidebarButtonsKeys.streamComparison,
                icon: ComparisonIcon,
            },
            {
                text: translate('navigation.download_manager'),
                clicked: false,
                key: sidebarButtonsKeys.downloadManager,
                icon: DownloadManagerIcon,
            },
        ],
        lowerButtons: [
            {
                text: translate('navigation.credits'),
                clicked: false,
                key: sidebarButtonsKeys.credits,
                icon: CreditsIcon,
            },
            {
                text: 'Settings',
                clicked: false,
                key: sidebarButtonsKeys.settings,
                icon: HelpIcon,
            },
            {
                text: translate('navigation.help'),
                clicked: false,
                key: sidebarButtonsKeys.help,
                icon: HelpIcon,
            },
        ],
    };

    const [buttons, setButtons] = React.useState<IButton>(buttonsList);

    let onSidebarClick = (buttonkey: number): void => {
        let newArray = { ...buttons };

        newArray.lowerButtons.forEach(item => {
            if (item.key === buttonkey) {
                item.clicked = true;
            } else {
                item.clicked = false;
            }
        });

        newArray.upperButtons.forEach(item => {
            if (item.key === buttonkey) {
                item.clicked = true;
            } else {
                item.clicked = false;
            }
        });

        setButtons(newArray);
    };

    return (
        <div>
            <Sidebar state={buttons} onClick={onSidebarClick} isCollapsed={isCollapsed} />
        </div>
    );
}

export default SidebarHOC;
