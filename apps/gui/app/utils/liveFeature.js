import React from 'react';
import { If } from 'react-extras';
import { ConditionalRoute } from 'react-router-util';
import { translate } from 'utils/translation';
import errorEnum from 'enums/errorEnum';
import ErrorPage from 'components/ErrorPage';

export const AppContext = React.createContext(false);

export const LiveFeature = props => (
    <AppContext.Consumer>
        {({ live }) => (
            <If condition={live}>
                {props.children}
            </If>
        )}
    </AppContext.Consumer>
);

export const LiveRoute = props => (
    <AppContext.Consumer>
        {({ live }) => (
            <ConditionalRoute
                path={props.path}
                exact={props.exact}
                conditional={live}
                trueComponent={props.component !== undefined ? props.component : props.render}
                falseComponent={props.hideOnFalse ? null : () => (
                    <ErrorPage
                        errorType={errorEnum.PAGE_NOT_FOUND}
                        errorMessage={translate('errors.404_message')}
                    />
                )}
            />
        )}
    </AppContext.Consumer>
);
