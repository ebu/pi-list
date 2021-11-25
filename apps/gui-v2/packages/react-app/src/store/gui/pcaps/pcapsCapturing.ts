import { atom } from 'recoil';
import SDK from '@bisect/ebu-list-sdk';

export const pcapsCapturingAtom = atom<SDK.types.IPcapFileCapturing[]>({
    key: 'pcapsCapturingAtom',
    default: [],
});
