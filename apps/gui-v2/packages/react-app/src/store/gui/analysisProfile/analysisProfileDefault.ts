import { atom } from 'recoil';

export const analysisProfileDefaultAtom = atom<string | undefined>({
    key: 'analysisProfileDefaultAtom',
    default: undefined,
});
