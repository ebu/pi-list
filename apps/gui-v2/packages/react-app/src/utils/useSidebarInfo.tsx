import React from 'react';
import { informationSidebarContentAtom } from 'store/gui/informationSidebar/informationSidebarContent';
import { useSetRecoilState } from 'recoil';
import { debounce } from 'lodash';

export type SetSidebarInfoType = (info: undefined | React.ReactElement) => void;

const useSidebarInfo = (): SetSidebarInfoType => {
    const setInformationSidebarContent = useSetRecoilState(informationSidebarContentAtom);

    const handleOnMouseEnterOrLeave = (extraPanelInformation: undefined | React.ReactElement) => {
        setInformationSidebarContent(extraPanelInformation);
    };

    return debounce(handleOnMouseEnterOrLeave, 300);
};

export default useSidebarInfo;

export interface IMouseOverHandler {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}
