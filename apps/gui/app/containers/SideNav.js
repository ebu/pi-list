import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import api from '../utils/api';
import MenuItem from '../components/MenuItem';
import sideNavItems from '../config/sideNavList';
import Icon from '../components/common/Icon';
import Button from '../components/common/Button';
import { T } from '../utils/translation';
import { StateContext } from '../utils/AppContext';

class SideNav extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: this.props.isOpen,
            showMenuItems: this.props.isOpen,
        };

        this.toggleSideNav = this.toggleSideNav.bind(this);
    }

    toggleSideNav() {
        const openState = this.state.isOpen;

        this.setState({ isOpen: !openState });

        setTimeout(() => {
            this.setState({ showMenuItems: !openState });
        }, 100);
    }

    renderItems(items, live) {
        return (
            <React.Fragment>
                {items
                    .filter(item =>
                        item.liveOnly === undefined || item.liveOnly === false
                            ? true
                            : live
                    )
                    .map(item => {
                        const label = <T t={item.labelTag} />;
                        return (
                            <MenuItem
                                key={`lst-side-nav-${item.link}`}
                                link={item.link}
                                icon={item.icon}
                                label={label}
                                exact={item.exact}
                                external={item.external}
                                isOpen={this.state.showMenuItems}
                            />
                        );
                    })}
            </React.Fragment>
        );
    }

    renderMain(live, version) {
        const sideNavClassNames = classNames('lst-side-nav', {
            'lst-side-nav__is-open': this.state.isOpen,
        });

        return (
            <nav
                className={sideNavClassNames}
                ref={sideNav => (this.sideNav = sideNav)}
            >
                <div className="lst-side-nav-header center-xs middle-xs">
                    <img src="/static/ebu-white.png" alt="ebu logo" />
                </div>
                <ul className="lst-side-nav__items">
                    {this.renderItems(sideNavItems.top, live)}
                </ul>
                {this.renderItems(sideNavItems.bottom, live)}
                <div className="lst-side-nav__options">
                    <Button noStyle onClick={() => this.toggleSideNav()}>
                        <div className="center-xs">
                            {`v${version.major}.${version.minor}`}
                            {this.state.showMenuItems && ` @ ${version.hash}`}
                        </div>
                    </Button>
                    <a
                        className="row middle-xs"
                        href="https://github.com/ebu/pi-list/issues"
                    >
                        <Icon value="help" />
                        {this.state.showMenuItems && (
                            <div className="fade-in">
                                <T t="navigation.help" />
                            </div>
                        )}
                    </a>
                    <a className="row middle-xs" href={api.logout()}>
                        <Icon value="power settings new" />
                        {this.state.showMenuItems && (
                            <div className="fade-in">
                                <T t="user_account.logout" />
                            </div>
                        )}
                    </a>
                </div>
            </nav>
        );
    }

    render() {
        return (
            <StateContext.Consumer>
                {([state, dispatch]) => {
                    const { live, version } = state;
                    return this.renderMain(live, version);
                }}
            </StateContext.Consumer>
        );
    }
}

SideNav.propTypes = {
    isOpen: PropTypes.bool,
};

SideNav.defaultProps = {
    isOpen: true,
};

export default SideNav;
