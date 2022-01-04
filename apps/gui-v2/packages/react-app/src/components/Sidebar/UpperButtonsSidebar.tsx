import React from 'react';
import './styles.scss';
import { LogoIcon } from '../icons/index';

interface IComponentProps {
    upperButtons: Array<Button>;
    onClick: (buttonkey: number) => void;
    isCollapsed: boolean;
}

export type Button = {
    text: string;
    clicked: boolean;
    key: number;
    icon?: ({ className }: { className?: string }) => JSX.Element;
};

function UpperButtonsSidebar({ upperButtons, onClick, isCollapsed }: IComponentProps) {
    return (
        <ul className="menu-list top">
            {upperButtons.map(button => {
                const Icon = button.icon;
                const icon = Icon ? <Icon className="sidebar-icons-to-center" /> : null;
                const isClickedAndCollapsed =
                    button.clicked && isCollapsed ? 'sidebar-item-collapsed-clicked' : 'sidebar-item-not-collapsed';
                return (
                    <li key={button.key}>
                        <a onClick={() => onClick(button.key)}>
                            <div className={button.clicked ? 'sidebar-items clicked' : 'sidebar-items'}>
                                {isCollapsed ? (
                                    <>
                                        <div style={{ visibility: 'hidden' }}>{button.text}</div>
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

export default UpperButtonsSidebar;
