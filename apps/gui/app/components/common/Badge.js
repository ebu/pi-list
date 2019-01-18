import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from 'components/common/Icon';

const propTypes = {
    type: PropTypes.oneOf(['success', 'danger', 'warning', 'info', 'undefined']),
    icon: PropTypes.string,
    text: PropTypes.string,
    className: PropTypes.string,
    mini: PropTypes.bool
};

const defaultProps = {
    type: 'info',
    text: '',
    icon: '',
    className: '',
    mini: false
};

const Badge = (props) => {
    const badgeClassName = classNames(
        'lst-badge',
        props.className,
        {
            'lst-badge--success': props.type === 'success',
            'lst-badge--danger': props.type === 'danger',
            'lst-badge--warning': props.type === 'warning',
            'lst-badge--info': props.type === 'info',
            'lst-badge--mini': props.mini
        }
    );

    return (
        <span className={badgeClassName}>
            {props.icon && (
                <Icon value={props.icon} />
            )}
            {props.text && (
                <span>{props.text}</span>
            )}
        </span>
    );
};

Badge.propTypes = propTypes;
Badge.defaultProps = defaultProps;

export default Badge;
