import React from 'react';
import PropTypes from "prop-types";
import Icon from "components/common/Icon";

const propTypes = {
    icon: PropTypes.string,
    message: PropTypes.string.isRequired,
};

const defaultProps = {
    icon: ''
};

const SimpleMessage = (props) => {
    return (
        <h2 className="lst-no-margin lst-text-dark-grey">
            <Icon value={props.icon}/>
            <span>{props.message}</span>
        </h2>
    );
};

SimpleMessage.propTypes = propTypes;
SimpleMessage.defaultProps = defaultProps;

export default SimpleMessage;
