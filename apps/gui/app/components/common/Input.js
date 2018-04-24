import React from 'react';

const Input = (props) => {
    return (
        <input
            className="lst-input"
            type={props.type}
            value={props.value}
            placeholder={props.placeholder}
            min={props.min}
            max={props.max}
            onChange={props.onChange}
            disabled={props.disabled || false}
        />
    );
};

export default Input;
