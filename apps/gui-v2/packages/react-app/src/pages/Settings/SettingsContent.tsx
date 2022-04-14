import Select from 'react-select';
import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { useNavigate } from 'react-router-dom';
import SettingsHeaderHOC from './Header/SettingsHeaderHOC';
import { GoogleAnalyticsHandler } from 'utils/googleAnalytics';
import { customStyles } from 'components/BaseSelector/BaseSelector';
export interface ILanguage {
    value: string;
    label: string;
}

export interface IProfileAnalysisData {
    value: string;
    label: string;
    id: string;
}

interface IComponentProps {
    languages: ILanguage[];
    onChangeLanguage: (e: any) => void;
    onDeleteUser: () => void;
    userData: SDK.api.user.IUserInfo;
    analysisProfileData: IProfileAnalysisData[];
    analysisProfileDefaultValue: IProfileAnalysisData;
    onChangeAnalysisProfile: (e: any) => void;
}

function SettingsContent({
    languages,
    onChangeLanguage,
    onDeleteUser,
    userData,
    analysisProfileData,
    analysisProfileDefaultValue,
    onChangeAnalysisProfile,
}: IComponentProps) {
    const navigate = useNavigate();

    const currentLanguage = languages.find(item => item.value === userData?.preferences?.gui?.language);
    const [gdprConsent, setGdprConsent] = React.useState<boolean>();

    React.useEffect(() => {
        const gdprConsentLocalStorage = localStorage.getItem('gdprConsent');
        if (gdprConsentLocalStorage) {
            setGdprConsent(gdprConsentLocalStorage === 'true' ? true : false);
        }
    }, []);

    const onGDPRClick = (gdpr: boolean) => {
        localStorage.setItem('gdprConsent', gdpr.toString());
        setGdprConsent(gdpr);
        navigate(0);
    };

    return (
        <>
            <GoogleAnalyticsHandler gdprConsent={gdprConsent} />
            <div className="main-page-header">
                <SettingsHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <div className="settings-page-container">
                    <div className="settings-container">
                        <div className="settings-title">
                            <span>System Settings</span>
                        </div>
                        <div className="settings-content-row">
                            <div className="settings-page-select">
                                <div className="settings-select-container">
                                    <div className="settings-select-label-container">
                                        <span className="settings-select-label">Language</span>
                                    </div>

                                    <Select
                                        styles={customStyles}
                                        options={languages}
                                        onChange={onChangeLanguage}
                                        value={currentLanguage}
                                    ></Select>
                                </div>
                            </div>
                            <div className="settings-page-select">
                                <div className="settings-select-container">
                                    <div className="settings-select-label-container">
                                        <span className="settings-select-label">Analysis Profile Data</span>
                                    </div>
                                    <Select
                                        styles={customStyles}
                                        options={analysisProfileData}
                                        onChange={onChangeAnalysisProfile}
                                        value={analysisProfileDefaultValue}
                                    ></Select>
                                </div>
                            </div>
                        </div>
                        <div className="settings-title">
                            <span>User Settings</span>
                        </div>
                        <div className="settings-content-column">
                            <div className="settings-delete-user">
                                <span className="user-settings-description">
                                    This will delete the user and all the data from the database.
                                </span>
                                <button className="settings-page-delete-user-button" onClick={onDeleteUser}>
                                    Delete User
                                </button>
                            </div>
                            <div className="settings-decline-gdpr">
                                {gdprConsent || typeof gdprConsent === 'undefined' ? (
                                    <>
                                        <span className="user-settings-description">
                                            This will decline the GDPR that was previously accepted on the login page.
                                        </span>
                                        <button
                                            className="settings-page-delete-user-button"
                                            onClick={() => onGDPRClick(false)}
                                        >
                                            Decline GDPR
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SettingsContent;
