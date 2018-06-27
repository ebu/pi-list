import React, { Component } from 'react';
import SideNav from 'containers/SideNav';
import routes from 'app/routes';
import headerRoutes from 'headerRoutes';
import asyncLoader from 'components/asyncLoader';
import api from 'utils/api';
import websocket from 'utils/websocket';
import { AppContext } from 'utils/liveFeature';

class App extends Component {
    constructor(props) {
        super(props);

        websocket.initialize(this.props.user.id);

        this.onMenuIconClick = this.onMenuIconClick.bind(this);
    }

    onMenuIconClick() {
        this.sideNav.toggleSideNav();
    }

    render() {
        return (
            <AppContext.Provider value={this.props.features.liveFeatures}>
                <div className="lst-app-container">
                    <SideNav ref={sideNav => this.sideNav = sideNav} isOpen={false} user={this.props.user}/>
                    <div className="lst-main">
                        <nav className="lst-top-nav row lst-no-margin">
                            <button className="lst-top-nav__link" onClick={this.onMenuIconClick}>
                                <i className="lst-top-nav__item-icon lst-icons">menu</i>
                            </button>
                            <div className="col-xs row lst-no-margin middle-xs">
                                {headerRoutes}
                            </div>
                        </nav>
                        <div className="lst-main-container">
                            {routes}
                        </div>
                    </div>
                </div>
            </AppContext.Provider>
        );
    }
}

export default asyncLoader(App, {
    asyncRequests: {
        user: () => api.getUser(),
        features: () => api.getFeatures()
    }
});
