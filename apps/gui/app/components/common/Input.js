import React from 'react';
import classNames from 'classnames';

const Input = (props) => {

    const classes = classNames(
        'lst-input',
        props.className,
        {
            'lst-input-full-width': !props.noFullWidth,
        }
    );

    return (
        <input
            className={classes}
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
