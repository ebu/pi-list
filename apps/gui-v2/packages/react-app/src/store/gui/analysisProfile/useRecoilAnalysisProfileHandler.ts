import React from 'react';
import list from '../../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { useSetRecoilState } from 'recoil';
import _ from 'lodash';
import { analysisProfileAtom } from './analysisProfile';
import { analysisProfileDefaultAtom } from './analysisProfileDefault';

export default () => {
    const setAnalysisProfileAtom = useSetRecoilState(analysisProfileAtom);
    const setAnalysisProfileDefault = useSetRecoilState(analysisProfileDefaultAtom);

    React.useEffect(() => {
        const loadAnalysisProfile = async (): Promise<void> => {
            const all: SDK.types.IAnalysisProfile = await list.pcap.analysisProfile.getInfo();
            setAnalysisProfileAtom(all.all);
            setAnalysisProfileDefault(all.default);
        };
        loadAnalysisProfile();
    }, []);
};
