import React, { Component } from 'react';
import api from 'utils/api';
import encrypt from 'utils/passwordEncrypter';
import Button from 'components/common/Button';
import Alert from 'components/common/Alert';
import AsyncErrorsManager from 'components/AsyncErrorsManager';
import keyEnum from 'enums/keyEnum';
import { translate } from 'utils/translation';

class Login extends Component {
    constructor() {
        super();

        this.onClickLogin = this.onClickLogin.bind(this);
        this.onKeyUpEnter = this.onKeyUpEnter.bind(this);
        this.onClickRegister = this.onClickRegister.bind(this);

        this.state = {
            errors: [],
            userSuccessfullyRegistered: false,
        };
    }

    componentWillMount() {
        document.addEventListener(keyEnum.EVENTS.KEY_UP, this.onKeyUpEnter);
    }

    onClickRegister() {
        const email = this.email.value;
        const password = this.password.value;

        api.getToken()
            .then(data => encrypt(password, data.t))
            .then(passwordEncrypted =>
                api.register({ email, password: passwordEncrypted })
            )
            .then(() => {
                this.setState({ userSuccessfullyRegistered: true, errors: [] });
            })
            .catch(error => {
                this.setState({
                    errors: [error.response.data],
                    userSuccessfullyRegistered: false,
                });
            });
    }

    onClickLogin() {
        const email = this.email.value;
        const password = this.password.value;

        api.getToken()
            .then(data => encrypt(password, data.t))
            .then(passwordEncrypted =>
                api.login({ email, password: passwordEncrypted })
            )
            .then(() => {
                this.props.history.push('/');
            })
            .catch(error => {
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
                    <img
                        src="/static/ebu_logo.svg"
                        alt="EBU List logo"
                        height="45px"
                    />
                </div>
                <div className="lst-login--logo lst-text-center">
                    <b>LIST</b> - LiveIP Software Toolkit
                </div>
                <div className="lst-login--form lst-text-center">
                    <h1 className="lst-login--header">
                        {translate('user_account.sign_in')}
                    </h1>
                    <div className="lst-login--group">
                        <input
                            className="lst-input"
                            ref={ref => (this.email = ref)}
                            type="email"
                            placeholder={translate('user_account.email')}
                        />
                    </div>
                    <div className="lst-login--group">
                        <input
                            className="lst-input"
                            ref={ref => (this.password = ref)}
                            type="password"
                            placeholder={translate('user_account.password')}
                        />
                    </div>

                    <div className="lst-login--group lst-no-margin">
                        {this.state.userSuccessfullyRegistered && (
                            <Alert type="success" showIcon>
                                {translate(
                                    'user_account.user_registered_message'
                                )}
                            </Alert>
                        )}
                        <AsyncErrorsManager errors={this.state.errors} />
                    </div>

                    <div className="lst-login--group lst-margin--bottom-2">
                        <div className="col-xs-6 lst-no-padding lst-padding--right-10">
                            <Button
                                className="lst-login-btn"
                                outline
                                label={translate('buttons.register')}
                                onClick={this.onClickRegister}
                                noMargin
                            />
                        </div>
                        <div className="col-xs-6 lst-no-padding lst-padding--left-10">
                            <Button
                                className="lst-login-btn"
                                type="info"
                                label={translate('buttons.login')}
                                onClick={this.onClickLogin}
                                noMargin
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
