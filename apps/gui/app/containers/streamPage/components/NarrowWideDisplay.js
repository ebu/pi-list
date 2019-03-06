import React, { Fragment } from 'react';
import MultiValueDisplay from './MultiValueDisplay';

const NarrowWideDisplay = ({ label, units, narrow, wide }) => {
    const values = [
        { label: 'narrow', value: narrow },
        { label: 'wide', value: wide },
    ];
    return <MultiValueDisplay label={label} units={units} values={values} />;
};

export default NarrowWideDisplay;
