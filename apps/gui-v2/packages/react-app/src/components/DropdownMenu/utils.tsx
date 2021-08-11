import React from 'react';
import { ReactNode } from 'react';

export const getLabelOrFromTag = (option: any): any => {
    return option.label || (option.labelTag ? option.labelTag : null);
};

export const getCurrentOptionLabel = (options: any, value: any) => {
    const current = options.find((option: any) => option.value === value);

    if (current !== undefined) {
        return getLabelOrFromTag(current);
    }

    if (options.length === 0) {
        return '';
    }

    return getLabelOrFromTag(options[0]);
};
