import React from 'react';
import './styles.scss';
import { LogoIcon } from '../icons/index';
import { sidebarButtonsKeys } from './Sidebar';

interface IComponentProps {
    lowerButtons: Array<Button>;
    onClick: (buttonkey: number) => void;
    isCollapsed: boolean;
}

export type Button = {
    text: string;
    clicked: boolean;
    key: number;
    icon?: ({ className }: { className?: string }) => JSX.Element;
};

function LowerButtonsSidebar({ lowerButtons, onClick, isCollapsed }: IComponentProps) {
    const Icon = LogoIcon;
    return (
        <ul className="menu-list bottom">
            {lowerButtons.map(button => {
                const Icon = button.icon;
                const icon = Icon ? <Icon className="sidebar-icons-to-center" /> : null;
                const isClickedAndCollapsed = button.clicked && isCollapsed ? 'sidebar-item-collapsed-clicked' : '';
                return (
                    <li key={button.key}>
                        <a onClick={() => onClick(button.key)}>
                            <div className={button.clicked ? 'sidebar-items clicked' : 'sidebar-items'}>
                                {isCollapsed ? (
                                    <>
                                        {!icon ? (
                                            <div
                                                className={
                                                    button.key === sidebarButtonsKeys.version ? 'version-collapsed' : ''
                                                }
                                            >
                                                {button.text.split('@')[0]}
                                            </div>
                                        ) : (
                                            <div style={{ visibility: 'hidden' }}>{button.text}</div>
                                        )}
                                        <div className={isClickedAndCollapsed}>{icon}</div>
                                    </>
                                ) : (
                                    <>
                                        <div>{button.text}</div> <div style={{ visibility: 'hidden' }}>{icon}</div>
                                    </>
                                )}
                            </div>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}

export default LowerButtonsSidebar;
