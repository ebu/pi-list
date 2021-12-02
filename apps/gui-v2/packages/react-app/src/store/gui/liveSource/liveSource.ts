import { atom } from 'recoil';
import SDK from '@bisect/ebu-list-sdk';

export const liveSourceAtom = atom<any[]>({
    key: 'liveSourceAtom',
    default: [],
});
