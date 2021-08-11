import React from 'react';
import './styles.scss';
import { ShortcutsIcon } from '../icons/index';

type Icons = {
    text: string;
    key: number;
};

type Shortcuts = {
    key: number;
    description: string;
    icons: Array<Icons>;
};

interface IShortcutsList {
    description: string;
    shortcuts: Array<Shortcuts>;
}

const getKey = (key: number): string => (key + 1).toString().padStart(2, '0');

function ContextHelp({ shortcutsList }: any) {
    const [information, setInformation] = React.useState<IShortcutsList>(shortcutsList);
    const Icon = ShortcutsIcon;

    return (
        <div className="context-help-content">
            <span className="context-help-title">Actions & details</span>
            <span className="context-help-description">{information.description}</span>
            <div className="context-help-shortcuts-icon">
                <Icon />
                <span>SHORTCUTS</span>
            </div>
            {information.shortcuts.map((item, index) => (
                <div className="context-help-shortcuts" key={index}>
                    <span className="context-help-shortcuts-key">{getKey(item.key)}</span>
                    <span className="context-help-shortcuts-description">{item.description}</span>
                    <div className="context-help-icons">
                        {item.icons.map((icon, index) => (
                            <span className="context-help-shortcuts-icons-text" key={index}>
                                {icon.text}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ContextHelp;
