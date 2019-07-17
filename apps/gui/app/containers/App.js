import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SideNav from './SideNav';
import routes from '../routes';
import headerRoutes from '../headerRoutes';
import asyncLoader from '../components/asyncLoader';
import api from '../utils/api';
import websocket from '../utils/websocket';
import { StateProvider, Actions, useStateValue } from '../utils/AppContext';
import NotificationsProvider from '../utils/notifications/NotificationsProvider';
import PopUp from '../components/common/PopUp';
import { T } from '../utils/translation';

const defaultTheme = 'dark';

const reducer = (state, action) => {
    switch (action.type) {
        case Actions.setLanguage:
            return {
                ...state,
                language: action.value,
            };

        case Actions.setTheme:
            return {
                ...state,
                theme: action.value,
            };

        case Actions.deleteUserRequest:
            return {
                ...state,
                showModal: true,
            };

        case Actions.deleteUserDismiss:
            return {
                ...state,
                showModal: false,
            };

        default:
            return state;
    }
};

const middleware = (state, action) => {
    switch (action.type) {
        case Actions.setLanguage:
            api.updateUserPreferences({ gui: { language: action.value } });
            break;

        case Actions.setTheme:
            api.updateUserPreferences({ gui: { theme: action.value } });
            break;

        case Actions.deleteUserExecute:
            api.deleteUser().then(() => {
                window.appHistory.push('/login');
            });
            break;

        default:
            break;
    }
};

const actionsWorkflow = (state, action) => {
    middleware(state, action);
    return reducer(state, action);
};

const AppContainer = props => {
    const sideNav = useRef(null);
    const [{ theme, showModal }, dispatch] = useStateValue();

    const account_delete_message = <T t="user_account.delete_confirmation" />;
    const account_delete_label = <T t="user_account.delete_user_account" />;

    return (
        <div className={`lst-app-container ${theme}`}>
            <SideNav ref={sideNav} isOpen={false} user={props.user} />
            <div className="lst-main">
                <nav className="lst-top-nav row lst-no-margin">
                    <button
                        className="lst-top-nav__link"
                        onClick={() => sideNav.current.toggleSideNav()}
                    >
                        <i className="lst-top-nav__item-icon lst-icons">menu</i>
                    </button>
                    <div className="col-xs row lst-no-margin middle-xs">
                        {headerRoutes}
                    </div>
                </nav>
                <NotificationsProvider>
                    <div className="lst-main-container">{routes}</div>
                </NotificationsProvider>
                <PopUp
                    type="delete"
                    visible={showModal}
                    message={account_delete_message}
                    label={account_delete_label}
                    onClose={() =>
                        dispatch({ type: Actions.deleteUserDismiss })
                    }
                    onDelete={() =>
                        dispatch({ type: Actions.deleteUserExecute })
                    }
                />
            </div>
        </div>
    );
};

AppContainer.propTypes = {
    user: PropTypes.object.isRequired,
};

const App = props => {
    useEffect(() => {
        websocket.initialize(props.user.id);
    }, []);

    const initialState = {
        language: props.user.preferences.gui.language,
        theme: props.user.preferences.gui.theme || defaultTheme,
        showModal: false,
        version: props.version,
        live: props.features.liveFeatures,
    };

    return (
        <StateProvider initialState={initialState} reducer={actionsWorkflow}>
            <AppContainer user={props.user} />
        </StateProvider>
    );
};

export default asyncLoader(App, {
    asyncRequests: {
        user: () => api.getUser(),
        features: () => api.getFeatures(),
        version: () => api.getVersion(),
    },
});
