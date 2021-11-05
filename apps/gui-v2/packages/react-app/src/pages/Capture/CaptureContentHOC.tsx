import React from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../../store/gui/user/userInfo';
import routeBuilder from '../../routes/routeBuilder';
import { MainContentLayout } from '../Common';
import CaptureContent from './CaptureContent';

function CaptureContentHOC() {
    const history = useHistory();
    const userInfo = useRecoilValue(userAtom);
    if (!userInfo) {
        return null;
    }

    const onTileDoubleClick = (id: string): void => {
        const route = routeBuilder.pcap_stream_list(id);
        history.push(route);
    };

    return (
        <>
            <MainContentLayout
                middlePageContent={
                    <CaptureContent
                        onTileDoubleClick={onTileDoubleClick}
                    />
                }
                informationSidebarContent={{ usermail: userInfo?.username }}
                logout={() => history.push('/logout')}
            />
        </>
    );
}

export default CaptureContentHOC;
