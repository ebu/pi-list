import { atom } from 'recoil';
import SDK from '@bisect/ebu-list-sdk';

export const pcapsAtom = atom<SDK.types.IPcapInfo[]>({
    key: 'pcapsAtom',
    default: [],
});
