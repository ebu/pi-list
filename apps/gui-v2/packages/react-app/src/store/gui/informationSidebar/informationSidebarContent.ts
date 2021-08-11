import { atom } from 'recoil';
import React from 'react'

export const informationSidebarContentAtom = atom<undefined | React.ReactElement>({
    key: 'informationSidebarContentAtom',
    default: undefined
  });