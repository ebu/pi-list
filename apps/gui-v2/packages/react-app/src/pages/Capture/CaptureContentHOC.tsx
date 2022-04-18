import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../../store/gui/user/userInfo';
import routeBuilder from '../../routes/routeBuilder';
import { MainContentLayout } from '../Common';
import CaptureContent from './CaptureContent';

function CaptureContentHOC() {
    const navigate = useNavigate();
    const userInfo = useRecoilValue(userAtom);
    if (!userInfo) {
        return null;
    }

    const onTileDoubleClick = (id: string): void => {
        const route = routeBuilder.pcap_stream_list(id);
        navigate(route);
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
- Select a <i><b>Live Sources</b></i> or more (with <i>ctrl</i>) from the table. <br/>
- Set the capture <i><b>Name</b></i> param and file <i><b>Duration</b></i>. <br/>
- If multiple sources are selected, choose <i><b>Mode</b></i> between <i><b>Simultaneous</b></i> and <i><b>Sequential</b></i>. <br/>
- Press <i><b>Capture</b></i> to perform PCAP capture and analysis. <br/>
- Double-click on card when the analysis is complete. <br/>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                } }
                logout={() => navigate('/logout')}
            />
        </>
    );
}

export default CaptureContentHOC;
