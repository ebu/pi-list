import React from 'react';
import Select from 'react-select';
//TODO See what are the pcaps parameters and make the interface for it

export const customStyles = {
    option: (provided: any, state: any) => ({
        ...provided,
        borderBottom: '2px solid #b5b8c1',
        color: state.isSelected ? 'white' : 'black',
        backgroundColor: state.isSelected ? '#b5b8c1' : 'white',
    }),
    control: (provided: any) => ({
        ...provided,
        height: 40,
    }),
    indicatorContainer: (provided: any) => ({ ...provided, height: 40 }),
    valueContainer: (provided: any) => ({ ...provided, height: 40 }),
    menuList: (base: any) => ({
        ...base,
        wordBreak: 'break-all',
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray',

        '::-webkit-scrollbar': {
            width: '6px',
        },
        '::-webkit-scrollbar-track': {
            background: 'none',
        },
        '::-webkit-scrollbar-thumb': {
            background: 'gray',
            borderRadius: '6px',
        },
        '::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    }),
};

function BaseSelector({ options, onChange, current }: any) {
    return <Select styles={customStyles} options={options} onChange={onChange} value={current}></Select>;
}

export default BaseSelector;
