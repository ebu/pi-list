import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import asyncLoader from '../../components/asyncLoader';

const Textarea = props => {
    return (
        <div>
            <label>
                { props.title }:
            </label>
            <textarea
                className='lst-textarea'
                type='textarea'
                value={ props.value  }
            ></textarea>
        </div>
    );
};

Textarea.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
};

Textarea.defaultProps = {
    title: '',
    value: '',
};

export default asyncLoader(Textarea, {
    asyncRequests: {
        value: props => {
            if (props.downloadPath !== null ) {
                return api.downloadText(props.downloadPath);
            }
            else {
                return '';
            }
        },
    },
    dependencyProps: ['downloadPath']
});
