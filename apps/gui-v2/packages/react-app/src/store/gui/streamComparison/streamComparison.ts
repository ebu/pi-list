import { atom } from 'recoil';
import SDK from '@bisect/ebu-list-sdk';

export const streamComparisonAtom = atom<any[]>({
    key: 'streamComparisonAtom',
    default: [],
});
