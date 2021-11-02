import React from 'react';
import { useHistory } from 'react-router-dom';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
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

    const onCapture = async (filename: string, duration: number, sources: string[]) => {
        console.log(`Capturing ${filename}`)
        await list.live.startCapture(filename, duration, sources);
        const captureResult = await list.live.makeCaptureAwaiter(filename, duration);
        if (!captureResult) {
            console.error('Pcap capture and processing failed');
            // todo show notif
        }
        return captureResult;
    };

    const onTileDoubleClick = (id: string): void => {
        const route = routeBuilder.pcap_stream_list(id);
        history.push(route);
    };

    return (
        <>
            <MainContentLayout
                middlePageContent={
                    <CaptureContent
                        onCapture={onCapture}
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
