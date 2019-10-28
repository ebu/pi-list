import React from 'react';
import MultiValueDisplay from './MultiValueDisplay';

const MinMaxDisplay = ({ label, labelTag, units, min, max, message, attention }) => {
    const values = [
        { label: 'min', value: min },
        { label: 'max', value: max },
    ];
    return <MultiValueDisplay label={label} labelTag={labelTag} units={units} values={values} message={message} attention={attention} />;
};

export default MinMaxDisplay;
