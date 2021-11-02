import React from 'react';
import { useHistory } from 'react-router-dom';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../../store/gui/user/userInfo';
import { MainContentLayout } from '../Common';
import CaptureContent from './CaptureContent';

function CaptureContentHOC() {
    const history = useHistory();
    const userInfo = useRecoilValue(userAtom);
    if (!userInfo) {
        return null;
    }

    const onCapture = async (name: string, duration: number, sources: string[]) => {
        const datetime: string = new Date().toLocaleString().split(" ").join("-").split("/").join("-");
        const filename = `${name}-${datetime}`;
        console.log(`Capturing ${filename}`)

        await list.live.startCapture(filename, duration, sources);
        const captureResult = await list.live.makeCaptureAwaiter(filename, duration);
        if (!captureResult) {
            console.error('Pcap capture and processing failed');
            return;
        }
    };

    return (
        <>
            <MainContentLayout
                middlePageContent={
                    <CaptureContent
                        onCapture={onCapture}
                    />
                }
                informationSidebarContent={{ usermail: userInfo?.username }}
                logout={() => history.push('/logout')}
            />
        </>
    );
}

export default CaptureContentHOC;
