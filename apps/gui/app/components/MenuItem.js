import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const propTypes = {
    link: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    exact: PropTypes.bool
};

const defaultProps = {
    exact: false
};

const MenuItem = props => (
    <li className="lst-side-nav__item">
        <NavLink
            to={props.link}
            className="lst-side-nav__link"
            activeClassName="active"
            exact={props.exact}
        >
            <i className="lst-side-nav__item-icon lst-icons">
                {props.icon}
            </i>
            {props.isOpen && <span className="lst-side-nav__item-text fade-in">{props.label}</span>}
        </NavLink>
    </li>
);

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;

export default MenuItem;
