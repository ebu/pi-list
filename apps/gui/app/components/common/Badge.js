import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from 'components/common/Icon';

const propTypes = {
    type: PropTypes.oneOf(['success', 'success2', 'danger', 'danger2', 'warning', 'warning2', 'info', 'undefined']),
    icon: PropTypes.string,
    text: PropTypes.string,
    className: PropTypes.string,
    mini: PropTypes.bool,
    border: PropTypes.bool
};

const defaultProps = {
    type: 'info',
    text: '',
    icon: '',
    className: '',
    mini: false,
    border: false
};

const Badge = (props) => {
    const badgeClassName = classNames(
        'lst-badge',
        props.className,
        {
            'lst-badge--success': props.type === 'success',
            'lst-badge--success2': props.type === 'success2',
            'lst-badge--danger': props.type === 'danger',
            'lst-badge--danger2': props.type === 'danger2',
            'lst-badge--warning': props.type === 'warning',
            'lst-badge--warning2': props.type === 'warning2',
            'lst-badge--info': props.type === 'info',
            'lst-badge--passive': props.type === 'passive',
            'lst-badge--mini': props.mini
        }
    );

    return (
        <span className={badgeClassName}>
            {props.icon && (
                <Icon value={props.icon} />
            )}
            {props.text}
        </span>
    );
};

Badge.propTypes = propTypes;
Badge.defaultProps = defaultProps;

export default Badge;
