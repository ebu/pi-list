import React, { Fragment } from 'react';
import FormInput from 'components/common/FormInput';

export function renderInformationList(information) {
    return (
        <Fragment>
            {information.map(item => (
                <FormInput key={`${item.key}_${item.value}`} label={item.key}>
                    {item.value}
                </FormInput>
            ))}
        </Fragment>
    );
}
