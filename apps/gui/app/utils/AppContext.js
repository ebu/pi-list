import React, { createContext, useContext, useReducer } from 'react';
import { If } from 'react-extras';
import { ConditionalRoute } from 'react-router-util';
import { translateX } from 'utils/translation';
import errorEnum from 'enums/errorEnum';
import ErrorPage from 'components/ErrorPage';

// from https://medium.com/simply/state-management-with-react-hooks-and-context-api-at-10-lines-of-code-baf6be8302c

export const StateContext = createContext();

export const StateProvider = ({ reducer, initialState, children }) => (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
        {children}
    </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);

export const Actions = {
    setLanguage: 'Actions.setLanguage', // { value }
    setTheme: 'Actions.setTheme', // { value }
    deleteUserRequest: 'Actions.deleteUserRequest', // { }
    deleteUserExecute: 'Actions.deleteUserExecute', // { }
    deleteUserDismiss: 'Actions.deleteUserDismiss', // { }
};

export const LiveFeature = props => {
    const [{ live }] = useStateValue();

    return <If condition={live}>{props.children}</If>;
};

export const LiveRoute = props => {
    const [{ live }] = useStateValue();
    return (
        <ConditionalRoute
            path={props.path}
            exact={props.exact}
            conditional={live}
            trueComponent={
                props.component !== undefined ? props.component : props.render
            }
            falseComponent={
                props.hideOnFalse
                    ? null
                    : () => (
                          <ErrorPage
                              errorType={errorEnum.PAGE_NOT_FOUND}
                              errorMessage={translateX('errors.404_message')}
                          />
                      )
            }
        />
    );
};
