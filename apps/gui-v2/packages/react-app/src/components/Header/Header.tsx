import React from 'react';
import './styles.scss';
import { DropdownMenu } from '../index';
import { ArrowCollapsedIcon } from '../icons';
import { translate } from '@ebu-list/translations';

interface IComponentProps {
    state?: ICategory[];
    headerTitle: string | undefined;
    onLocalHeaderClick?: (key: number) => void;
    dropdownMenu?: boolean;
    subtitle?: string;
}

function Header({ state, headerTitle, onLocalHeaderClick, dropdownMenu, subtitle }: IComponentProps) {
    return (
        <div className="header">
            <span className="header-title">{headerTitle}</span>
            {subtitle ? <div className="header-subtitle">{subtitle}</div> : null}
            {state && onLocalHeaderClick ? (
                <div className="header-categories">
                    <ul>
                        {state.map(category => (
                            <li key={category.key}>
                                <a
                                    onClick={() => onLocalHeaderClick(category.key)}
                                    className={category.clicked ? 'header-category-clicked' : 'header-category'}
                                >
                                    <span className="header-category-label">{category.name}</span>{' '}
                                    <span className="header-category-value">{category.count}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

export interface ICategory {
    name: string;
    key: number;
    clicked: boolean;
    count?: number;
}

export default Header;
