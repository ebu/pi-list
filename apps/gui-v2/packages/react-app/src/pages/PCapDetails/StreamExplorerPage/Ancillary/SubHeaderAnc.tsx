import React from 'react';
import './styles.scss';

function SubHeaderAnc({ onClick, categories }: { onClick: (index: number) => void; categories: any }) {
    const onLocalSubHeaderClick = (index: number) => {
        onClick(index);
    };

    return (
        <div className="sub-header-container">
            <div className="sub-header-categories">
                <ul>
                    {categories?.map((item: any) => (
                        <li key={item.index}>
                            <a
                                onClick={() => onLocalSubHeaderClick(item.index)}
                                className={item.clicked ? 'sub-header-category-clicked' : 'sub-header-category'}
                            >
                                <span className="sub-header-category-label">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SubHeaderAnc;
