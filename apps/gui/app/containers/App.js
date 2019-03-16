import React, { Component } from 'react';
import SideNav from 'containers/SideNav';
import routes from 'app/routes';
import headerRoutes from 'headerRoutes';
import asyncLoader from 'components/asyncLoader';
import api from 'utils/api';
import websocket from 'utils/websocket';
import { AppContext } from '../utils/liveFeature';
import { ThemeContext } from 'utils/theme';
import NotificationsProvider from '../utils/notifications/NotificationsProvider';

class App extends Component {
    constructor(props) {
        super(props);

        websocket.initialize(this.props.user.id);

        this.onMenuIconClick = this.onMenuIconClick.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);

        this.state = {
            theme: 'dark',
            toggleTheme: this.toggleTheme
        };
    }

    onMenuIconClick() {
        this.sideNav.toggleSideNav();
    }

    toggleTheme() {
        this.setState(prevState => ({
            theme:
                prevState.theme === 'light' ? 'dark' : 'light'
        }));
    }

    render() {
        const meta = {
            live: this.props.features.liveFeatures,
            version: this.props.version
        };

        return (
            <ThemeContext.Provider value={this.state}>
                <AppContext.Provider value={meta}>
                    <div className={`lst-app-container ${this.state.theme}`}>
                        <SideNav ref={sideNav => this.sideNav = sideNav} isOpen={false} user={this.props.user} />
                        <div className="lst-main">
                            <nav className="lst-top-nav row lst-no-margin">
                                <button className="lst-top-nav__link" onClick={this.onMenuIconClick}>
                                    <i className="lst-top-nav__item-icon lst-icons">menu</i>
                                </button>
                                <div className="col-xs row lst-no-margin middle-xs">
                                    {headerRoutes}
                                </div>
                            </nav>
                            <NotificationsProvider>
                                <div className="lst-main-container">
                                    {routes}
                                </div>
                            </NotificationsProvider>
                        </div>
                    </div>
                </AppContext.Provider>
            </ThemeContext.Provider>
        );
    }
}

export default asyncLoader(App, {
    asyncRequests: {
        user: () => api.getUser(),
        features: () => api.getFeatures(),
        version: () => api.getVersion()
    }
});
