import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PopUp from '../components/common/PopUp';
import { translateX } from '../utils/translation';
import { Actions } from '../utils/AppContext';

const GDPR = props => {

    const handleAccept = (val) => {
        props.dispatch({ type: Actions.acceptGDPR, value: val });
    };

    return (
        <PopUp
            type="yesno"
            visible={props.visible}
            label={translateX('gdpr.modal.title')}
            message={translateX('gdpr.modal.content')}
            onClose={() => handleAccept(false)}
            onDoAction={() => handleAccept(true)}
        />
    );
};

GDPR.propTypes = {
    visible: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
};

GDPR.defaultProps = {
    visible: false,
};

export default GDPR;
