import React, { Component } from 'react';
import { map, isObject, isFunction, zipObject } from 'lodash';
import Loader from 'components/common/Loader';
import ErrorPage from 'components/ErrorPage';

/**
 * asyncLoader
 *
 * Async Loader is a high order component (HoC) that handles async dependencies.
 *
 * This HoC should be used to wrap a component that needs to load/fetch data asynchronously and during the loading
 * process it needs to render a Loader. The async information should be declared in the `asyncRequests`. The loaded
 * dependencies/data will be passed as props with the same name as have been declared in the `asyncRequests`.
 *
 * An example of usage:
 *
 * ```
 *  class Hello extends React.Component {
 *      render() {
 *          return (<h1>Hello, {this.props.user.name}!</h1>);
 *      }                                   |
 *  }                                       ->  available as prop when the data is loaded component
 *
 *  export default asyncLoader(Hello, {
 *      asyncRequests: {
 *    ----> user: function () {
 *   |        return axios.get('/api/user/').then(request => request.data);
 * defined here
 *          }
 *      }
 *  })
 *
 * ```
 *
 * Each function in `asyncRequests` receives as argument the `props` passed in the component and it should return
 * a promise.
 *
 * Finally, this high order component has 3 possible states:
 * * Loading
 *   It fetch all information passed in the asyncRequests and renders a loading spinner (a.k.a Loader).
 * * Data/dependencies loaded successfully
 *   Renders the original component with the fetch data in the component props.
 * * Data/dependencies loading process fails
 *   Renders an error page component, with the information about the error.
 *
 * The other possible settings:
 *  - `loaderProps`
 *
 * @param {React.Component} Component
 * @param {Object} options
 * @returns {React.Component}
 */

export default function(AsyncComponent, options) {
    return class extends Component {
        constructor() {
            super();

            this.state = {
                loading: true,
                asyncRequestsFailed: false,
                error: null,
            };
        }

        componentDidMount() {
            const functionNames = [];

            if (isObject(options.asyncRequests)) {
                // Build an array of promises by iterate all functions of `asyncRequests`.
                const asyncRequests = map(
                    options.asyncRequests,
                    asyncRequest => {
                        if (isFunction(asyncRequest)) {
                            const promise = asyncRequest(this.props);

                            if (promise instanceof Promise) {
                                functionNames.push(asyncRequest.name);
                                return promise;
                            }
                        }
                    }
                );

                // Load all information requested
                Promise.all(asyncRequests)
                    .then(results => {
                        this.setState({
                            loading: false,
                            // Lets assume that results are originated form 3 functions which return 3 promises
                            // and the functions names are: user, pcaps, streams.
                            // results = [ { ... }, { ... }, { ... } ]
                            // the zipObject will create a object with the following structure.
                            // {
                            //     "user":    { ... },
                            //     "pcaps":   { ... },
                            //     "streams": { ... }
                            // }
                            asyncResults: zipObject(functionNames, results),
                        });
                    })
                    .catch(e => {
                        this.setState(
                            {
                                loading: false,
                                asyncRequestsFailed: true,
                                error: e,
                            },
                            () => {
                                if (isFunction(options.onError)) {
                                    options.onError(this.props);
                                }
                            }
                        );
                    });
            }
        }

        render() {
            if (this.state.loading) {
                const props = isObject(options.loaderProps)
                    ? options.loaderProps
                    : {};
                const loadingWidget = props.loadingWidget || (
                    <Loader {...props} />
                );

                return (
                    <div className="lst-async-loader--loading">
                        {loadingWidget}
                    </div>
                );
            } else if (this.state.asyncRequestsFailed) {
                const errorConfiguration = {
                    errorType: isObject(options.errorPage)
                        ? options.errorPage.errorType
                        : this.state.error.message,
                    message: isObject(options.errorPage)
                        ? options.errorPage.message
                        : `Cannot connect to ${this.state.error.config.url}`,
                    icon: isObject(options.errorPage)
                        ? options.errorPage.icon
                        : null,
                    button: isObject(options.errorPage)
                        ? options.errorPage.button
                        : null,
                };

                return React.isValidElement(options.onErrorComponent) ? (
                    options.onErrorComponent
                ) : (
                    <ErrorPage
                        errorType={errorConfiguration.errorType}
                        errorMessage={errorConfiguration.message}
                        icon={errorConfiguration.icon}
                        button={errorConfiguration.button}
                        originalProps={this.props}
                    />
                );
            }

            return (
                <AsyncComponent {...this.state.asyncResults} {...this.props} />
            );
        }
    };
}
