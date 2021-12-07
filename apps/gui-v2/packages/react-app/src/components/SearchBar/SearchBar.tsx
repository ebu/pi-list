import React from 'react';
import './styles.scss';
import { ButtonWithIcon } from 'components/index';
import { BinIcon } from 'components/icons';

export interface IComponentProps {
    filterString: string;
    setFilterString: (newString: string) => void;
}

function SearchBar({ filterString, setFilterString }: IComponentProps) {
    return (
        <div className="search-bar-container">
            <div>
                <input
                    className="search-bar-input"
                    type="text"
                    value={filterString}
                    onChange={evt => {
                        setFilterString(evt.currentTarget.value);
                    }}
                />
            </div>
            <ButtonWithIcon
                icon={BinIcon}
                text="Cancel"
                onClick={() => {
                    setFilterString('');
                }}
            />
        </div>
    );
}

export default SearchBar;
