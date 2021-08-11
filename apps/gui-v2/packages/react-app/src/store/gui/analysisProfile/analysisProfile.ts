import { atom } from 'recoil';
import SDK from '@bisect/ebu-list-sdk';

export const analysisProfileAtom = atom<SDK.types.IAnalysisProfileDetails[]>({
    key: 'analysisProfileAtom',
    default: [],
});
