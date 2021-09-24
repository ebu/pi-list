import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import LoginPage from 'components/LoginPage/LoginPage';
import list from '../utils/api';
import News from 'components/News/News';
import { EbuListLogoIcon } from 'components/icons';
import useLoginWithToken from 'utils/useLoginWithToken';

const Login = (): any => {
    const history = useHistory();
    const [loginError, setLoginError] = React.useState<boolean>(false);
    const [registerError, setRegisterError] = React.useState<boolean>(false);
    const [gdprConsent, setGdprConsent] = React.useState<boolean>();
    const [version, setVersion] = React.useState<any>();

    React.useEffect(() => {
        const gdprConsentLocalStorage = localStorage.getItem('gdprConsent');
        if (gdprConsentLocalStorage) {
            setGdprConsent(gdprConsentLocalStorage === 'true' ? true : false);
        }
    }, []);

    React.useEffect(() => {
        const getVersion = async (): Promise<void> => {
            const version = await list.info.getVersion();
            setVersion(version);
        };
        getVersion();
    }, []);

    console.log(version);

    const onGdprConsentClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        localStorage.setItem('gdprConsent', (!gdprConsent).toString());
        if (e.target.checked === false) {
            window.localStorage.removeItem('gdprConsent');
        }
        setGdprConsent(e.target.checked);
    };

    const onGDPRClick = (gdpr: boolean) => {
        localStorage.setItem('gdprConsent', gdpr.toString());
        setGdprConsent(gdpr);
    };

    useLoginWithToken();

    const handleLogin = async (username: string, password: string): Promise<void> => {
        try {
            await list.login(username, password);
            setLoginError(false);
            history.push('/');
        } catch (e) {
            setLoginError(true);
            console.error(`login error: ${JSON.stringify(e)}`);
        }
    };

    const handleRegister = async (username: string, password: string): Promise<void> => {
        try {
            await list.user.create(username, password);
            setRegisterError(false);
            await handleLogin(username, password);
        } catch (e) {
            console.error(`register error: ${JSON.stringify(e)}`);
            setRegisterError(true);
        }
    };

    let loginComponent;

    if (typeof gdprConsent !== 'undefined' || gdprConsent === null) {
        loginComponent = (
            <LoginPage
                onClickLogin={handleLogin}
                backendLoginError={loginError}
                handleErrorLoginBackend={setLoginError}
                onClickRegister={handleRegister}
                backendRegisterError={registerError}
                handleErrorRegisterBackend={setRegisterError}
            />
        );
    } else {
        loginComponent = null;
    }

    return (
        <div className="login-page">
            <EbuListLogoIcon className={'login-page-logo'} />
            <span className="login-page-version">{`v${version?.major}.${version?.minor}.${version?.patch}:${version?.hash}`}</span>
            <div className="login-items-container">
                {loginComponent}
                <News gdprConsent={gdprConsent} onGdprConsentClick={onGdprConsentClick} onGDPRClick={onGDPRClick} />
            </div>
        </div>
    );
};

export default Login;
