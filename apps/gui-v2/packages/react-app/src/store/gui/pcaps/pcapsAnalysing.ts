import { atom } from 'recoil';
import SDK from '@bisect/ebu-list-sdk';

export const pcapsAnalysingAtom = atom<SDK.types.IPcapFileReceived[]>({
    key: 'pcapsAnalysingAtom',
    default: [],
});
