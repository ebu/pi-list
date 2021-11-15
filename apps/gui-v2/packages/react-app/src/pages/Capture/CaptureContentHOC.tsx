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
                informationSidebarContent={ {
                        usermail: userInfo?.username,
                        content: (
                            <div style={{ height: '100vh', overflow: 'auto' }}>
                                <div className="sb-information-sidebar-content">
                                    <div className="capture-description-container">
                                        <span
                                        className="capture-description-title">Pcap Capture Help</span>
                                        <span className="capture-description-text">
- Select one or more <i>Live Sources</i> (streams) from the table. <br/>
- Set the capture <i>Name</i> param and file <i>Duration</i>. <br/>
- If multiple sources are selected, choose <i>Mode</i> between <i>Parallel</i> (simultaenous) or <i>Sequential</i>. <br/>
- Press <i>Capture</i> to perform PCAP capture and analysis.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                } }
                logout={() => history.push('/logout')}
            />
        </>
    );
}

export default CaptureContentHOC;
