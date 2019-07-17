import React, { Fragment } from 'react';
import Alert from 'components/common/Alert';

const AsyncErrorsManager = props => (
    <Fragment>
        {props.errors.map((error, index) => (
            <Alert
                type="danger"
                className="fade-in"
                key={`alert-${error.code}-${index}`}
                showIcon
            >
                {error.message}
            </Alert>
        ))}
    </Fragment>
);

export default AsyncErrorsManager;
