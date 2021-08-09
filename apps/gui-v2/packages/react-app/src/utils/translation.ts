import { translate as tr } from '@ebu-list/translations';
import { userAtom } from '../store/gui/user/userInfo';
import { useRecoilValue } from 'recoil';

export function translate(phrase: string, value?: any) {
    const userInfo = useRecoilValue(userAtom);
    if (!userInfo) {
        return null;
    }
    const language = userInfo.preferences.gui.language;
    return tr(phrase, language, value);
}

export function T({ t, value }: { t: string; value?: any }) {
    const userInfo = useRecoilValue(userAtom);
    if (!userInfo) {
        return null;
    }
    const language = userInfo.preferences.gui.language;
    return tr(t, language, value);
}
