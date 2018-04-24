import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import api from 'utils/api';
import MenuItem from 'components/MenuItem';
import sideNavItems from 'config/sideNavList';
import Icon from 'components/common/Icon';
import Button from 'components/common/Button';
import PopUp from 'components/common/PopUp';

const propTypes = {
    isOpen: PropTypes.bool
};

const defaultProps = {
    isOpen: true
};

class SideNav extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: this.props.isOpen,
            showMenuItems: this.props.isOpen,
            showModal: false
        };

        this.toggleSideNav = this.toggleSideNav.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.onClickDeleteUser = this.onClickDeleteUser.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    toggleSideNav() {
        const openState = this.state.isOpen;

        this.setState({ isOpen: !openState });

        setTimeout(() => {
            this.setState({ showMenuItems: !openState });
        }, 100);
    }

    onClickDeleteUser() {
        this.setState({showModal: true});
    }

    hideModal() {
        this.setState({showModal: false});
    }

    deleteAccount() {
        api.deleteUser()
            .then(() => {
                this.hideModal();
                window.appHistory.push("/login");
            });
    }

    render() {
        const sideNavClassNames = classNames('lst-side-nav', {
            'lst-side-nav__is-open': this.state.isOpen
        });

        return (
            <nav className={sideNavClassNames} ref={sideNav => (this.sideNav = sideNav)}>
                <div className="lst-side-nav-header center-xs middle-xs">
                    <img src="/static/ebu-white.png"/>
                </div>
                <ul className="lst-side-nav__items">
                    {sideNavItems.map(item => (
                        <MenuItem
                            key={`lst-side-nav-${item.link}`}
                            link={item.link}
                            icon={item.icon}
                            label={item.label}
                            exact={item.exact}
                            isOpen={this.state.showMenuItems}
                        />))}
                </ul>
                <div className="lst-side-nav__user row middle-xs">
                    <div className="col-xs-2">
                        {this.props.user.photoURL && (
                            <img className="lst-side-nav__user-photo" src={this.props.user.photoURL} />
                        )}
                    </div>
                    {(this.state.showMenuItems && this.props.user.username) ? (
                        <div className="lst-side-nav__user-info col-xs-10 fade-in">
                            <div className="lst-side-nav__user-name col-xs-12">
                                {this.props.user.username}
                            </div>
                            <div className="lst-side-nav__user-email fade-in col-xs-12">
                                {this.props.user.email}
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className="lst-side-nav__options">
                    <Button noStyle onClick={() => this.onClickDeleteUser()}>
                        <Icon value="delete" />
                        {this.state.showMenuItems && (
                            <div className="fade-in lst-no-margin">Delete Account</div>
                        )}
                    </Button>
                    <a className="row middle-xs" href={api.logout()}>
                        <Icon value="power settings new" />
                        {this.state.showMenuItems && (
                            <div className="fade-in">Logout out</div>
                        )}
                    </a>
                </div>
                <PopUp
                    type="delete"
                    visible={this.state.showModal}
                    message={`Are you sure you want to your account? This action will delete all data and it's irreversible!`}
                    resource="user account"
                    onClose={this.hideModal}
                    onDelete={this.deleteAccount}
                />
            </nav>
        );
    }
}

SideNav.propTypes = propTypes;
SideNav.defaultProps = defaultProps;

export default SideNav;
