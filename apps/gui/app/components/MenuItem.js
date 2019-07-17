import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Icon from './common/Icon';

const insideRender = props => (
    <React.Fragment>
        <Icon value={props.icon} className="lst-side-nav__item-icon" />
        {props.isOpen && (
            <span className="lst-side-nav__item-text fade-in">
                {props.label}
            </span>
        )}
    </React.Fragment>
);

const internalLinkRender = props => (
    <NavLink
        to={props.link}
        className="lst-side-nav__link"
        activeClassName="active"
        exact={props.exact}
    >
        {insideRender(props)}
    </NavLink>
);

const externalLinkRender = props => (
    <a href={props.link} rel="noopener noreferrer" target="_blank">
        {insideRender(props)}
    </a>
);

const MenuItem = props => {
    const renderer = props.external ? externalLinkRender : internalLinkRender;

    return <li className="lst-side-nav__item">{renderer(props)}</li>;
};

MenuItem.propTypes = {
    link: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    exact: PropTypes.bool,
    external: PropTypes.bool,
};

MenuItem.defaultProps = {
    exact: false,
    external: false,
};
export default MenuItem;
