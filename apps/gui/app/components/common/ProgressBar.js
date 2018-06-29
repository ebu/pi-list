import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
    percentage: PropTypes.number.isRequired,
    className: PropTypes.string
};

const defaultProps = {
    className: ''
};

const ProgressBar = (props) => {
    const progressBarClassName = classNames(
        'lst-progress-bar',
        props.className
    );

    return (
        <div className={progressBarClassName}>
            <div className="progress" style={{ width: `${props.percentage}%` }} />
        </div>
    );
};

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;

export default ProgressBar;
