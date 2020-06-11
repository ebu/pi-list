import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Icon from './common/Icon';

const LargeItem = (props) => {
    return (
        <div className="lst-home-nav__item">
            <NavLink
                to={props.link}
                exact={props.exact}
                className="lst-side-nav__link center-xs"
            >
                <div className="col-md-4">
                    <Icon value={props.icon} className="lst-home-nav__item-icon" />
                </div>
                <div className="col-md-8">
                    {props.isOpen && (
                        <span className="lst-home-nav__item-text">
                            {props.label}
                        </span>
                    )}
                </div>
            </NavLink>
        </div>
    );
};

LargeItem.propTypes = {
    link: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    exact: PropTypes.bool,
};

LargeItem.defaultProps = {
    exact: false,
};
export default LargeItem;
