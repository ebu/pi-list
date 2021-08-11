import React from 'react';
import './styles.scss';

function ButtonWithIcon({ text, onClick, icon }: IComponentProps) {
    const Icon = icon;
    return (
        <div className="button-with-icon-container">
            <Icon />
            <button className="button-with-icon-text" onClick={() => onClick()}>
                {text}
            </button>
        </div>
    );
}

export interface IComponentProps {
    icon: ({ className }: { className?: string }) => JSX.Element;
    onClick: () => Window | null | void;
    text: string;
}

export default ButtonWithIcon;
