import { atom } from 'recoil';
import SDK from '@bisect/ebu-list-sdk';

export const userAtom = atom<SDK.api.user.IUserInfo | undefined>({
    key: 'userAtom',
    default: undefined,
});
