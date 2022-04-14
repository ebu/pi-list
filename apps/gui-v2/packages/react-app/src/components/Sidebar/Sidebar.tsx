import React from 'react';
import './styles.scss';
import { LogoIcon } from '../icons/index';
import { useNavigate } from 'react-router-dom';
import LowerButtonsSidebar from './LowerButtonsSidebar';
import UpperButtonsSidebar from './UpperButtonsSidebar';

interface IComponentProps {
    state: IButton;
    onClick: (buttonkey: number) => void;
    isCollapsed: boolean;
}

export const sidebarButtonsKeys = {
    analysis: 0,
    streamComparison: 1,
    downloadManager: 2,
    credits: 3,
    help: 4,
    settings: 5,
    collapse: 6,
    version: 7,
    capture: 8,
};

export type Button = {
    text: string;
    clicked: boolean;
    key: number;
    icon?: ({ className }: { className?: string }) => JSX.Element;
};

function Sidebar({ state, onClick, isCollapsed }: IComponentProps) {
    const Icon = LogoIcon;
    const navigate = useNavigate();
    return (
        <div className={` sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <aside className="sidebar-menu">
                <div className="sidebar-logo" onClick={() => navigate('/')}>
                    <Icon />
                </div>
                <UpperButtonsSidebar upperButtons={state.upperButtons} onClick={onClick} isCollapsed={isCollapsed} />
            </aside>
            <aside>
                <LowerButtonsSidebar lowerButtons={state.lowerButtons} onClick={onClick} isCollapsed={isCollapsed} />
            </aside>
        </div>
    );
}

export interface IButton {
    upperButtons: Array<Button>;
    lowerButtons: Array<Button>;
}

export default Sidebar;
