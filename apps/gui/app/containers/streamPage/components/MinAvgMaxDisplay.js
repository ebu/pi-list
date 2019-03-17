import React from 'react';
import MultiValueDisplay from './MultiValueDisplay';

const MinAvgMaxDisplay = ({ label, labelTag, units, min, avg, max }) => {
    const values = [
        { label: 'min', value: min },
        { label: 'avg', value: avg },
        { label: 'max', value: max },
    ];
    return <MultiValueDisplay label={label} labelTag={labelTag} units={units} values={values} />;
};

export default MinAvgMaxDisplay;
