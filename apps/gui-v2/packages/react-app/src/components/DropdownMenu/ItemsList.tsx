import React from 'react';
import { getLabelOrFromTag } from './utils';

const getStyle = (width: any) =>
    width && {
        maxWidth: `${width}rem`,
        minWidth: `${width}rem`,
    };

const Item = ({ option, isActive, onClick }: IItem) => {
    const label = getLabelOrFromTag(option);
    const onC = () => !option.disabled && onClick(option.value);
    const onKeyDown = () => {};
    return (
        <div
            className={`${isActive ? 'is-active' : ''} ${option.disabled ? 'is-disabled' : ''}`}
            onClick={option.disabled ? () => {} : onC}
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
        >
            {label}
        </div>
    );
};

interface IItem {
    option: IOption;
    isActive: boolean;
    onClick: (key: string) => void;
}

interface IOption {
    value: string;
    label: string;
    disabled?: boolean;
    isLabel?: boolean;
}

const LabelItem = ({ option }: ILabelItem) => {
    const label = getLabelOrFromTag(option);
    return <div className="is-label">{label}</div>;
};

interface ILabelItem {
    option: any;
}

function ItemsList({ value, options, width, onChange }: IItemsList) {
    const o = options || [];

    const items = o.map((option: IOption) =>
        option.isLabel ? (
            <LabelItem key={option.value} option={option} />
        ) : (
            <Item key={option.value} isActive={value === option.value} option={option} onClick={onChange} />
        )
    );

    return (
        <div className="select-items" style={getStyle(width)}>
            {items}
        </div>
    );
}

interface IItemsList {
    value: string;
    options: Array<IOption>;
    width: number;
    onChange: any;
}

ItemsList.defaultProps = {
    value: null,
    width: undefined,
};

export default ItemsList;
