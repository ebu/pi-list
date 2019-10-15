import React from 'react';
import classNames from 'classnames';

const Input = (props) => {

    const classes = classNames(
        'lst-input',
        props.className,
        {
            'lst-input-full-width': !props.noFullWidth && !props.width,
        }
    );

    const attrs = {
        style: {

        }
    };

    if (props.width) {
        attrs.style.width = props.width;
    }

    if (props.border) {
        attrs.style.border = props.border;
    }

    return (
        <input
            className={classes}
            type={props.type}
            value={props.value}
            placeholder={props.placeholder}
            min={props.min}
            max={props.max}
            onChange={props.onChange}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            disabled={props.disabled || false}
            { ...attrs }
        />
    );
};

export default Input;
