import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isString } from 'lodash';
import Icon from 'components/common/Icon';

const Panel = props => {
    const cardClassNames = classNames('lst-panel', props.className);

    const titleClassNames = classNames('fit-to-div', props.titleClassName);

    const containerClassNames = classNames('lst-panel__container', props.containerClassName, {
        'lst-panel--no-padding': props.noPadding,
        'lst-panel--padding': !props.noPadding,
        'lst-panel--no-border': props.noBorder,
        'lst-panel--border': !props.noBorder,
        'lst-panel--full-height': props.fullHeight,
    });

    return (
        <div className={cardClassNames}>
            <div className={containerClassNames}>
                {isString(props.title) ? (
                    <div className="row lst-panel__header lst-truncate">
                        <div className="col-xs-6">
                            <h2 className={titleClassNames}>
                                {props.icon && <Icon value={props.icon} />}
                                {props.title}
                            </h2>
                        </div>
                        <div className="col-xs-6 end-xs">{props.rightToolbar}</div>
                    </div>
                ) : (
                    props.title
                )}
                {props.children}
            </div>
        </div>
    );
};

Panel.propTypes = {
    className: PropTypes.string,
    titleClassName: PropTypes.string,
    containerClassName: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    noPadding: PropTypes.bool,
    noBorder: PropTypes.bool,
    fullHeight: PropTypes.bool,
    rightToolbar: PropTypes.node,
    icon: PropTypes.string,
};

Panel.defaultProps = {
    className: '',
    titleClassName: '',
    containerClassName: '',
    title: null,
    noPadding: false,
    noBorder: false,
    fullHeight: false,
    rightToolbar: null,
    icon: '',
};

export default Panel;
