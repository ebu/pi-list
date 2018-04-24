import React from 'react';
import Button from 'components/common/Button';

const ButtonGroup = (props) => {
    return (
        <div className="lst-button-group">
            {props.options.map(option => (
                <Button
                    key={`${option.value}_${option.label}`}
                    type={props.type}
                    size={props.size}
                    label={option.label}
                    outline
                    noMargin
                    noAnimation
                    onClick={() => props.onChange(option)}
                    selected={option.value === props.selected}
                />
            ))}
        </div>
    );
};

export default ButtonGroup;
