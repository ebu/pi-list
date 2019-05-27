import React from 'react';
import Select from '../components/common/Select';
import api from '../utils/api';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import asyncLoader from '../components/asyncLoader';
import { useStateValue, Actions } from '../utils/AppContext';
import { localeNames, T } from '../utils/translation';

const Settings = (props) => {

    const [{ language, theme }, dispatch] = useStateValue();

    const themes = [
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' }
    ];

    const languageKeys = Object.keys(localeNames).sort();
    const languages = languageKeys.map(key => {
        return { value: key, label: localeNames[key] };
    });

    const onChange = e => {
        dispatch({
            type: Actions.setTheme,
            value: e.value
        });
    };

    const onChangeLanguage = e => {
        dispatch({
            type: Actions.setLanguage,
            value: e.value
        });
    };

    const onDeleteUser = e => {
        dispatch({
            type: Actions.deleteUserRequest
        });
    };

    return (
        <div className="lst-settings-page col-md-6">
            <div className="row lst-align-items-center">
                <div className="col-xs-4 lst-text-right lst-stream-info2-label"><T t="settings.theme" />:</div>
                <div className="col-xs-8">
                    <Select
                        options={themes}
                        value={theme}
                        onChange={onChange}
                    />
                </div>
            </div>
            <div className="row lst-align-items-center">
                <div className="col-xs-4 lst-text-right lst-stream-info2-label"><T t="settings.language" />:</div>
                <div className="col-xs-8">
                    <Select
                        options={languages}
                        value={language}
                        onChange={onChangeLanguage}
                    />
                </div>
            </div>
            <hr />
            <Button onClick={onDeleteUser}>
                <Icon value="delete" />
                <span className="fade-in lst-no-margin"><T t="user_account.delete_user_account" /></span>
            </Button>

        </div>
    );
};

export default asyncLoader(Settings, {
    asyncRequests: {
        user: (props) => {
            return api.getUser();
        }
    }
});
