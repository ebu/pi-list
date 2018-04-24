import React from 'react';
import classNames from 'classnames';

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

export default ProgressBar;
