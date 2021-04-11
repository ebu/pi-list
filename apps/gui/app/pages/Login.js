import React from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import api, { client } from '../utils/api';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import AsyncErrorsManager from '../components/AsyncErrorsManager';
import { translate } from '../utils/translation';
import { useOnEnter } from '../utils/useKeyboard';

const Login = ({ history }) => {
    const [user, setUser] = React.useState('');
    const [pass, setPass] = React.useState('');
    const [errors, setErrors] = React.useState([]);
    const [userSuccessfullyRegistered, setUserSuccessfullyRegistered] = React.useState(false);

    const onClickLogin = () => {
        client
            .login(user, pass)
            .then(error => {
                if (error) {
                    console.error(JSON.stringify(error));
                    setErrors(['Login failed']);
                } else {
                    history.push('/');
                }
            })
            .catch(() => {
                setErrors(['Login failed']);
            });
    };

    useOnEnter(onClickLogin);

    const onClickRegister = () => {
        api.register({ username: user, password: pass })
            .then(() => {
                setUserSuccessfullyRegistered(true);
                setErrors([]);
            })
            .catch(error => {
                console.error(JSON.stringify(error));
                setUserSuccessfullyRegistered(false);
                setErrors(['Failed to register a new user. Make sure you provide a unique user name and a password.']);
            });
    };

    const enabled = user !== '';

    const location = useLocation();

    if (location.search) {
        const queryParams = queryString.parse(location.search);
        console.log(JSON.stringify(queryParams));

        if (queryParams.token) {
            client.setToken(queryParams.token);
            history.push(queryParams.location || '/');
        }
    }

    return (
        <div className="lst-login--container row center-xs middle-xs fade-in">
            <div className="lst-login--logo lst-text-center">
                <img src="/static/ebu_list_266x64.png" alt="EBU List logo" />
            </div>
            <div className="lst-login--form lst-text-center">
                <h1 className="lst-login--header">{translate('user_account.sign_in')}</h1>
                <div className="lst-login-info">
                    <p>To register a new user, enter a user name and a password and press the register button.</p>
                    <p>If you are already registered, enter your credentials and press the login button.</p>
                </div>
                <div className="lst-login--group">
                    <input
                        className="lst-input"
                        type="username"
                        placeholder={translate('user_account.email')}
                        value={user}
                        onChange={e => setUser(e.target.value)}
                    />
                </div>
                <div className="lst-login--group">
                    <input
                        className="lst-input"
                        type="password"
                        placeholder={translate('user_account.password')}
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                    />
                </div>

                <div className="lst-login--group lst-no-margin">
                    {userSuccessfullyRegistered && (
                        <Alert type="success" showIcon>
                            {translate('user_account.user_registered_message')}
                        </Alert>
                    )}
                    <AsyncErrorsManager errors={errors} />
                </div>

                <div className="lst-login--group lst-margin--bottom-2">
                    <div className="col-xs-6 lst-no-padding lst-padding--right-10">
                        <Button
                            className="lst-login-btn"
                            outline
                            label={translate('buttons.register')}
                            onClick={onClickRegister}
                            noMargin
                            disabled={!enabled}
                        />
                    </div>
                    <div className="col-xs-6 lst-no-padding lst-padding--left-10">
                        <Button
                            className="lst-login-btn"
                            type="info"
                            label={translate('buttons.login')}
                            onClick={onClickLogin}
                            noMargin
                            disabled={!enabled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
