import Select from 'react-select';
import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import SettingsHeaderHOC from './Header/SettingsHeaderHOC';

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

const customStyles = {
    option: (provided: any, state: any) => ({
        ...provided,
        borderBottom: '2px solid #b5b8c1',
        color: state.isSelected ? 'white' : 'black',
        backgroundColor: state.isSelected ? '#b5b8c1' : 'white',
    }),
    control: (provided: any) => ({
        ...provided,
        height: 40,
    }),
    indicatorContainer: (provided: any) => ({ ...provided, height: 40 }),
    valueContainer: (provided: any) => ({ ...provided, height: 40 }),
    menuList: (base: any) => ({
        ...base,
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray',

        '::-webkit-scrollbar': {
            width: '6px',
        },
        '::-webkit-scrollbar-track': {
            background: 'none',
        },
        '::-webkit-scrollbar-thumb': {
            background: 'gray',
            borderRadius: '6px',
        },
        '::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    }),
};

function SettingsContent({
    languages,
    onChangeLanguage,
    onDeleteUser,
    userData,
    analysisProfileData,
    analysisProfileDefaultValue,
    onChangeAnalysisProfile,
}: IComponentProps) {
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
    };

    return (
        <>
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
                                <button className="settings-page-delete-user-button" onClick={onDeleteUser}>
                                    Delete User
                                </button>
                            </div>
                            <div>
                                {gdprConsent || typeof gdprConsent === 'undefined' ? (
                                    <a className="news-privacy-notice-decline" onClick={() => onGDPRClick(false)}>
                                        Decline
                                    </a>
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
