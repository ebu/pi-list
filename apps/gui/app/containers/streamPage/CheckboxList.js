import React  from 'react';
import PropTypes from 'prop-types';

const CheckboxList = (props) => {
    const onChange = (key, value) => {
        const newState = { ...props.values, [key]: value};
        props.onChange(newState);
    };

    return (
        <div className="list-group-item form-group">
        {Object.keys(props.values).map((i) => (
            <div className="checkbox" key={i}>
                <label>
                    <input onChange={(e) => onChange(i, e.target.checked)} type='checkbox' checked={props.values[i]} />
                    {parseInt(i) + 1}
                </label>
            </div>
        ))}
        </div>
    );
};

CheckboxList.propTypes = {
    values: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};

CheckboxList.defaultProps = {
};

export default CheckboxList;
