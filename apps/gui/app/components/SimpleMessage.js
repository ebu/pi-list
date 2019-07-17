import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';

const SimpleMessage = props => {
    return (
        <h2 className="lst-no-margin lst-text-dark-grey">
            <Icon value={props.icon} />
            <span>{props.message}</span>
        </h2>
    );
};

SimpleMessage.propTypes = {
    icon: PropTypes.string,
    message: PropTypes.any.isRequired,
};

SimpleMessage.defaultProps = {
    icon: '',
};

export default SimpleMessage;
