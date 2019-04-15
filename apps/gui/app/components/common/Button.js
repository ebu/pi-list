import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from 'components/common/Icon';
import Loader from 'components/common/Loader';

const propTypes = {
    type: PropTypes.string,
    size: PropTypes.string,
    className: PropTypes.string,
    outline: PropTypes.bool,
    noMargin: PropTypes.bool,
    disabled: PropTypes.bool,
    selected: PropTypes.bool,
    link: PropTypes.bool,
    label: PropTypes.any,
    icon: PropTypes.string,
    noAnimation: PropTypes.bool,
    onClick: PropTypes.func,
    noStyle: PropTypes.bool,
    downloadPath: PropTypes.string,
    externalPath: PropTypes.string
};

const defaultProps = {
    type: 'default',
    size: 'default',
    className: '',
    label: '',
    icon: null,
    selected: false,
    link: false,
    outline: false,
    noMargin: false,
    disabled: false,
    noAnimation: false,
    onClick: null,
    noStyle: false,
    downloadPath: null,
    externalPath: null
};

const Button = (props) => {
    const buttonClassNames = classNames(
        'lst-btn',
        props.className,
        {
            // Button colors
            'lst-btn--primary': props.type === 'primary',
            'lst-btn--success': props.type === 'success',
            'lst-btn--danger': props.type === 'danger',
            'lst-btn--warning': props.type === 'warning',
            'lst-btn--info': props.type === 'info',

            // Button sizes
            'lst-btn--mini': props.size === 'mini',

            // Disable Animation
            'lst-btn--no-animation': props.noAnimation === true || props.noStyle === true,

            // Button link
            'lst-btn--link': props.link === true,

            // Outline
            'lst-btn--outline': props.outline === true,

            // Without margin
            'lst-btn--no-margin': props.noMargin === true,

            // No Style
            'lst-btn--no-style': props.noStyle === true,

            selected: props.selected === true
        }
    );

    return (
        <button
            type="button"
            className={buttonClassNames}
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.loading && <Loader size="mini" className="lst-padding-right-30 lst-no-margin" inverted />}
            {props.icon && <Icon value={props.icon} />}
            {props.externalPath &&
                <a href={props.externalPath} rel="noopener noreferrer" target="_blank">{props.label}</a>
            }
            {props.downloadPath
                ? <a href={props.downloadPath} download>{props.label}</a>
                : props.label}
            {props.children}

        </button>
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
