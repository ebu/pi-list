import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
    icon: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.string,
    showIcon: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

const defaultProps = {
    icon: '',
    type: 'danger',
    className: '',
    showIcon: false
};

const Alert = (props) => {
    let icon;

    const alertClassName = classNames(
        'lst-alert',
        'col-xs-12',
        props.className,
        {
            'lst-alert--success': props.type === 'success',
            'lst-alert--danger': props.type === 'danger',
            'lst-alert--warning': props.type === 'warning',
            'lst-alert--info': props.type === 'info',
        }
    );

    const showIcon = props.showIcon || props.icon;

    switch (props.type) {
    case 'success':
        icon = 'check_circle';
        break;
    case 'warning':
        icon = 'warning';
        break;
    case 'info':
        icon = 'info';
        break;
    case 'danger':
    default:
        icon = 'error';
        break;
    }

    if (props.icon) {
        icon = props.icon;
    }

    return (
        <div className={alertClassName}>
            {showIcon && (
                <div className="lst-alert__icon">
                    <i className="lst-alert__icon-size lst-icons">{icon}</i>
                </div>
            )}
            <div className="lst-alert__content">
                {props.children}
            </div>
        </div>
    );
};

Alert.propTypes = propTypes;
Alert.defaultProps = defaultProps;

export default Alert;
