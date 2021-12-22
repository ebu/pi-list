import React from 'react';
import { locales, localeNames } from '@ebu-list/translations';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../utils/api';
import './styles.scss';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import SettingsContent, { ILanguage, IProfileAnalysisData } from './SettingsContent';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userAtom } from '../../store/gui/user/userInfo';
import { MainContentLayout } from '../Common';
import { analysisProfileAtom } from '../../store/gui/analysisProfile/analysisProfile';
import { analysisProfileDefaultAtom } from '../../store/gui/analysisProfile/analysisProfileDefault';
import { GoogleAnalyticsHandler } from 'utils/googleAnalytics';

function SettingsHOC() {
    const history = useHistory();
    const [userInfo, setuserInfo] = useRecoilState(userAtom);
    const [gdprConsent, setGdprConsent] = React.useState<boolean>();

    React.useEffect(() => {
        const gdprConsentLocalStorage = localStorage.getItem('gdprConsent');
        if (gdprConsentLocalStorage) {
            setGdprConsent(gdprConsentLocalStorage === 'true' ? true : false);
        }
    }, []);

    const pagePath: string = window.location.pathname;

    const analysisProfile = useRecoilValue(analysisProfileAtom);
    const [analysisProfileDefault, setAnalysisProfileDefault] = useRecoilState(analysisProfileDefaultAtom);

    const analysisProfileData: IProfileAnalysisData[] = [];

    analysisProfile.map((item: SDK.types.IAnalysisProfileDetails, index: number) => {
        analysisProfileData.push({
            value: (index + 1).toString(),
            label: item.label,
            id: item.id,
        });
    });

    if (!analysisProfileDefault) {
        return null;
    }

    const analysisProfileDefaultValue = analysisProfileData.find(
        (profile: IProfileAnalysisData) => profile.id === analysisProfileDefault
    );
    if (!analysisProfileDefaultValue) {
        return null;
    }

    const onChangeAnalysisProfile = async (e: IProfileAnalysisData) => {
        await list.analysisProfile.setDefault(e.id);
        setAnalysisProfileDefault(e.id);
    };

    const languageKeys = Object.keys(localeNames).sort();
    const languages: ILanguage[] = languageKeys.map((key: any) => ({
        value: key,
        label: localeNames[key],
    }));

    if (!userInfo) {
        return null;
    }

    const onDeleteUser = async () => {
        await list.user.delete({}).then(() => {
            history.push('/login');
        });
    };

    const onChangeLanguage = async (e: ILanguage) => {
        await list.user.updateUserPreferences({ gui: { language: e.value } });
        const newData = _.cloneDeep(userInfo);
        newData.preferences.gui.language = e.value;
        setuserInfo(newData);
    };

    return (
        <>
            <GoogleAnalyticsHandler gdprConsent={gdprConsent} pathName={pagePath} />
            <MainContentLayout
                middlePageContent={
                    <SettingsContent
                        languages={languages}
                        onChangeLanguage={onChangeLanguage}
                        onDeleteUser={onDeleteUser}
                        userData={userInfo}
                        analysisProfileData={analysisProfileData}
                        analysisProfileDefaultValue={analysisProfileDefaultValue}
                        onChangeAnalysisProfile={onChangeAnalysisProfile}
                    />
                }
                informationSidebarContent={{ usermail: userInfo?.username }}
                logout={() => history.push('/logout')}
            />
        </>
    );
}

export default SettingsHOC;
