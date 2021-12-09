import './styles.scss';
import { SearchIcon, CancelIcon } from 'components/icons/index';

export interface IComponentProps {
    filterString: string;
    setFilterString: (newString: string) => void;
}

function SearchBar({ filterString, setFilterString }: IComponentProps) {
    return (
        <div className="search-bar-container">
            <button className="search-icon">
                <SearchIcon />
            </button>
            <input
                className="search-bar-input"
                type="text"
                placeholder="Search"
                value={filterString}
                onChange={evt => {
                    setFilterString(evt.currentTarget.value);
                }}
            />
            {filterString !== '' ? (
                <button className="cancel-icon" onClick={() => setFilterString('')}>
                    <CancelIcon />
                </button>
            ) : null}
        </div>
    );
}

export default SearchBar;
