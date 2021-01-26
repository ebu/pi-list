import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';
//import Icon from 'components/common/Icon';

const propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    type: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    min: 0,
    max: 100,
    type: "",
    onChange: null,
};

const Slider = (props) => {
    const [value, setValue] = useState(0);
    const icon_low = props.type==="zoom"? "zoom_out" : "";
    const icon_high = props.type==="zoom"? "zoom_in" : "";
    const onChange = (e) => {
        e.persist();
        setValue(e.target.value);
        props.onChange(e.target.value);
    }

    return (
        <div className="row center-xs">
            <Icon
                className="lst-icons"
                value={icon_low}
            />
            <input
                type="range"
                min={`${props.min}`}
                max={`${props.max}`}
                value={value}
                onChange={onChange}
            />
            <Icon
                className="lst-icons"
                value={icon_high}
            />
        </div>
    );
};

Slider.propTypes = propTypes;
Slider.defaultProps = defaultProps;

export default Slider;
