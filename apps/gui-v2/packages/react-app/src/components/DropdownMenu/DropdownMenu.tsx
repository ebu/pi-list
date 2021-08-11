import React from 'react';
import ItemsList from './ItemsList';
import { ArrowCollapsedIcon } from '../icons';
import { useShowHide } from './useShowHide';
import './dropdown-menu.scss';

const getButton = (icon: any, button: any) => {
    if (button) return button;
    const Icon = icon || ArrowCollapsedIcon;
    return <Icon />;
};

function DropdownMenu({ width, className, options, disabled, onChange, icon, button }: IComponentsProps) {
    const { isOpen, onClick, onItemClick, onFocus, onBlur, onMouseOver, onMouseOut } = useShowHide(disabled, onChange);
    const onKeyDown = () => {};

    const selector = getButton(icon, button);

    return (
        <div
            className={`laab-dropdown-menu ${className} ${disabled ? 'disabled' : ''}`}
            onBlur={onBlur}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onFocus={onFocus}
        >
            <div
                className={`select-button ${isOpen ? 'select-open' : ''}`}
                onClick={onClick}
                role="button"
                onKeyDown={onKeyDown}
                tabIndex={0}
            >
                {selector}
            </div>
            {isOpen && <ItemsList options={options} width={width} onChange={onItemClick} />}
        </div>
    );
}

interface IComponentsProps {
    width?: number;
    className?: string;
    options: Array<IOptions>;
    disabled?: boolean;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    button?: React.ReactNode;
}

interface IOptions {
    value: string;
    label: string;
}

export default DropdownMenu;
