import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from 'components/common/Icon';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    noPadding: PropTypes.bool,
    noBorder: PropTypes.bool,
    fullHeight: PropTypes.bool,
    backgroundColor : PropTypes.oneOf(['red','green', 'yellow', 'blue', 'white', "gray"])
};

const defaultProps = {
    className: '',
    title: '',
    noPadding: false,
    noBorder: false,
    fullHeight: false,
};

const Panel = (props) => {
    const cardClassNames = classNames(
        'lst-panel',
        props.className
    );

    const containerClassNames = classNames(
        'lst-panel__container',
        {
            'lst-panel--no-padding': props.noPadding,
            'lst-panel--padding': !props.noPadding,
            'lst-panel--no-border': props.noBorder,
            'lst-panel--border': !props.noBorder,
            'lst-panel--full-height': props.fullHeight
        }
    );

    return (
        <div className={cardClassNames}>
            <div className={containerClassNames}>
                {props.title && (
                    <div className="lst-panel__header lst-truncate">
                        <h2>{props.icon && <Icon value={props.icon}/>}{props.title}</h2>
                    </div>
                )}
                {props.children}
            </div>
        </div>
    );
};

Panel.propTypes = propTypes;
Panel.defaultProps = defaultProps;

export default Panel;
