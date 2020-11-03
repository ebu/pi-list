import React from 'react';
import PropTypes from 'prop-types';
import './BadgeIcon.scss';

const BadgeIcon = (props) => {
    return (
        <div className="badge-icon-wrapper">
            <span className="badge">{props.value}</span>
        </div>
    );
};

BadgeIcon.propTypes = {
    value: PropTypes.string,
};
BadgeIcon.defaultProps = {
    value: 0,
};

export default BadgeIcon;
