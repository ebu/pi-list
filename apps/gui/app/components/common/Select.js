import React from 'react';
import PropTypes from 'prop-types';
import _Select from 'react-select';

const Select = props => (
    <_Select
        clearable={false}
        searchable={false}
        options={props.options}
        value={props.value}
        onChange={props.onChange}
    />
);

Select.propTypes = {
    options: PropTypes.array.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

Select.defaultProps = {
    value: null,
};

export default Select;
