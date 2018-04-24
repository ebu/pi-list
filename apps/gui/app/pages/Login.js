import React, { Component } from 'react';
import api from 'utils/api';
import encrypt from 'utils/passwordEncrypter';
import Button from 'components/common/Button';
import Alert from 'components/common/Alert';
import AsyncErrorsManager from 'components/AsyncErrorsManager';
import keyEnum from 'enums/keyEnum';

class Login extends Component {
    constructor() {
        super();

        this.onMenuIconClick = this.onMenuIconClick.bind(this);
        this.onClickLogin = this.onClickLogin.bind(this);
        this.onKeyUpEnter = this.onKeyUpEnter.bind(this);
        this.onClickRegister = this.onClickRegister.bind(this);

        this.state = {
            errors: [],
            userSuccessfullyRegistered: false
        };
    }

    componentWillMount() {
        document.addEventListener(keyEnum.EVENTS.KEY_UP, this.onKeyUpEnter);
    }

    onMenuIconClick() {
        this.sideNav.toggleSideNav();
    }

    onClickRegister() {
        const email = this.email.value;
        const password = this.password.value;

        api.getToken()
            .then(data => encrypt(password, data.t))
            .then(passwordEncrypted => api.register({ email, password: passwordEncrypted }))
            .then(() => {
                this.setState({ userSuccessfullyRegistered: true, errors: [] });
            })
            .catch((error) => {
                this.setState({ errors: [error.response.data], userSuccessfullyRegistered: false });
            });
    }

    onClickLogin() {
        const email = this.email.value;
        const password = this.password.value;

        api.getToken()
            .then(data => encrypt(password, data.t))
            .then(passwordEncrypted => api.login({ email, password: passwordEncrypted }))
            .then(() => {
                this.props.history.push('/');
            })
            .catch((error) => {
                this.setState({ errors: [error.response.data] });
            });
    }

    onKeyUpEnter(event) {
        if (event.code === keyEnum.ENTER) {
            return this.onClickLogin();
        }
    }

    componentWillUnmount() {
        document.removeEventListener(keyEnum.EVENTS.KEY_UP, this.onKeyUpEnter);
    }

    render() {
        return (
            <div className="lst-login--container row center-xs middle-xs fade-in">
                <div className="lst-login--logo lst-text-center">
                    <img src="/static/ebu_logo.svg" alt="EBU List logo" height="45px" />
                </div>
                <div className="lst-login--logo lst-text-center">
                    <b>LIST</b> - LiveIP Software Toolkit
                </div>
                <div className="lst-login--form lst-text-center">
                    <h1 className="lst-login--header">Sign In</h1>
                    <div className="lst-login--group">
                        <input
                            className="lst-input"
                            ref={ref => this.email = ref}
                            type="email"
                            placeholder="Email"
                        />
                    </div>
                    <div className="lst-login--group">
                        <input
                            className="lst-input"
                            ref={ref => this.password = ref}
                            type="password"
                            placeholder="Password"
                        />
                    </div>

                    <div className="lst-login--group lst-no-margin">
                        {this.state.userSuccessfullyRegistered && (
                            <Alert type="success" showIcon>
                                User successfully Registered
                            </Alert>
                        )}
                        <AsyncErrorsManager errors={this.state.errors} />
                    </div>

                    <div className="lst-login--group">
                        <div className="col-xs-6 lst-no-padding lst-padding--right-10">
                            <Button className="lst-login-btn" outline label="Register" onClick={this.onClickRegister} noMargin />
                        </div>
                        <div className="col-xs-6 lst-no-padding lst-padding--left-10">
                            <Button className="lst-login-btn" type="info" label="login" onClick={this.onClickLogin} noMargin />
                        </div>
                    </div>

                    <h3 className="lst-login--heading">or</h3>

                    <div className="lst-login--group lst-no-margin">
                        <a
                            className="lst-btn lst-login-btn lst-btn--outline lst-btn--info lst-no-margin lst-external-login"
                            href={api.authenticateWithFacebook()}
                        >
                            Sign in with facebook
                        </a>
                    </div>

                    <div className="lst-login--group">
                        <a
                            className="lst-btn lst-login-btn lst-btn--outline lst-btn--danger lst-no-margin lst-external-login"
                            href={api.authenticateWithFacebook()}
                        >
                            Sign in with Google
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
