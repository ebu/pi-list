import React from 'react';
import { AppContext } from './NotificationsProvider';

export function withNotifications(Component) {
    return function WrapperComponent(props) {
        return (
            <AppContext.Consumer>
                {state => <Component {...props} notificationsContext={state} />}
            </AppContext.Consumer>
        );
    };
}