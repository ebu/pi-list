import React, { ReactHTMLElement } from 'react';
import './styles.scss';
import { useOnEnter } from '../../utils/useOnKey';

interface IProps {
    onClickLogin: (username: string, password: string) => void;
    onClickRegister: (username: string, password: string) => void;
    backendLoginError: boolean;
    handleErrorLoginBackend: (isError: boolean) => void;
    backendRegisterError: boolean;
    handleErrorRegisterBackend: (isError: boolean) => void;
}

function LoginPage({
    onClickLogin,
    onClickRegister,
    backendLoginError,
    handleErrorLoginBackend,
    backendRegisterError,
    handleErrorRegisterBackend,
}: IProps) {
    const [username, setUsername] = React.useState<string | null>(null);
    const [password, setPassword] = React.useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = React.useState<string | null>(null);
    const [isRegister, setIsRegister] = React.useState<boolean>(false);

    const [registerError, setRegisterError] = React.useState<boolean>(backendLoginError);
    const [loginError, setLoginError] = React.useState<boolean>(backendLoginError);

    const [registerErrorMessage, setRegisterErrorMessage] = React.useState<string>('');
    const [loginErrorMessage, setLoginErrorMessage] = React.useState<string>('');

    const inputRef = React.useRef(null);

    React.useEffect(() => {
        const el = inputRef.current as HTMLInputElement | null;
        if (el === null) return;

        el.focus();
    }, [inputRef.current]);

    const resetState = () => {
        setRegisterError(false);
        setLoginError(false);
        setRegisterErrorMessage('');
        setLoginErrorMessage('');
        handleErrorLoginBackend(false);
        handleErrorRegisterBackend(false);
    };
    const handleClickLogin = () => {
        resetState();
        if (isRegister) {
            setIsRegister(false);
        } else {
            if (!username || !password) {
                setLoginError(true);
                setLoginErrorMessage('Please fill all the fields');
            } else {
                onClickLogin(username, password);
            }
        }
    };

    const handleClickRegister = () => {
        resetState();
        if (!isRegister) {
            setIsRegister(true);
        } else {
            if (!username || !password || !confirmPassword) {
                setRegisterError(true);
                setRegisterErrorMessage('Please fill all the fields');
            } else if (password !== confirmPassword) {
                setRegisterError(true);
                setRegisterErrorMessage('The passwords do not match');
            } else {
                onClickRegister(username, password);
            }
        }
    };

    if (isRegister) {
        useOnEnter(handleClickRegister);
    } else {
        useOnEnter(handleClickLogin);
    }

    const onUsernameChange = (e: any) => {
        setUsername(e.target.value);
    };

    const onPasswordChange = (e: any) => {
        setPassword(e.target.value);
    };

    const onPasswordConfirmChange = (e: any) => {
        setConfirmPassword(e.target.value);
    };

    return (
        <div className="login-page-container">
            <span className="login-page-title">{isRegister ? 'REGISTER' : 'LOGIN'}</span>
            <div className="login-page-inputs">
                {isRegister ? (
                    <>
                        <input
                            type="text"
                            className="login-page-username-input"
                            ref={inputRef}
                            placeholder="Username"
                            onChange={onUsernameChange}
                        ></input>
                        <input
                            type="password"
                            className="login-page-password-input"
                            placeholder="Password"
                            onChange={onPasswordChange}
                        ></input>
                        <input
                            type="password"
                            className="login-page-password-input"
                            placeholder="Confirm Password"
                            onChange={onPasswordConfirmChange}
                        ></input>
                        <span
                            className={`${
                                registerError
                                    ? 'login-page-warning-labels'
                                    : backendRegisterError
                                    ? 'login-page-warning-labels'
                                    : 'isUnseen login-page-warning-labels'
                            }`}
                        >
                            {registerError
                                ? registerErrorMessage
                                : backendRegisterError
                                ? 'The username is already being used'
                                : null}
                        </span>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            className="login-page-username-input"
                            ref={inputRef}
                            placeholder="Username"
                            onChange={onUsernameChange}
                        ></input>
                        <input
                            type="password"
                            className="login-page-password-input"
                            placeholder="Password"
                            onChange={onPasswordChange}
                        ></input>
                        <span
                            className={`${
                                loginError
                                    ? 'login-page-warning-labels'
                                    : backendLoginError
                                    ? 'login-page-warning-labels'
                                    : 'isUnseen login-page-warning-labels'
                            }`}
                        >
                            {loginError
                                ? loginErrorMessage
                                : backendLoginError
                                ? 'The credentials used are not correct'
                                : null}
                        </span>
                    </>
                )}

                <div>
                    <a className={`login-page-buttons ${isRegister ? 'isDisabled' : ''}`} onClick={handleClickLogin}>
                        Login
                    </a>
                    <a className="login-page-buttons" onClick={handleClickRegister}>
                        Register
                    </a>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
