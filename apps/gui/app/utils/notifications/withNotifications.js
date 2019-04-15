import React from 'react';
import { NotificationsContext } from './NotificationsProvider';

export function withNotifications(Component) {
    return function WrapperComponent(props) {
        return (
            <NotificationsContext.Consumer>
                {state => <Component {...props} notificationsContext={state} />}
            </NotificationsContext.Consumer>
        );
    };
}