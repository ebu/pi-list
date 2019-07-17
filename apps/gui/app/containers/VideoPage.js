import React, { useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Tabs from '../components/common/Tabs';
import AnalysisPanel from './streamPage/AnalysisPanel';
import VideoStreamInformation from './streamPage/VideoStreamInformation';
import CbufferAnalysis from './streamPage/CbufferAnalysis';
import VrxAnalysis from './streamPage/VrxAnalysis';
import TvdAnalysis from './streamPage/TvdAnalysis';
import VideoExplorer from './streamPage/VideoExplorer';
import PerFrameAnalysisViewer from './streamPage/PerFrameAnalysisViewer';
import RtpAnalysisViewer from './streamPage/RtpAnalysisViewer';

const TABS = [
    AnalysisPanel,
    VideoStreamInformation,
    VideoExplorer,
    CbufferAnalysis,
    VrxAnalysis,
    TvdAnalysis,
    RtpAnalysisViewer,
    PerFrameAnalysisViewer,
];

const VideoPage = props => {
    const [tabIndex, setTabIndex] = useState(0);

    const CurrentTabComponent = TABS[tabIndex];

    return (
        <div className="lst-stream-info-tab lst-full-height">
            <Tabs
                headers={[
                    {
                        label: 'Analysis',
                        icon: 'info',
                    },
                    {
                        label: 'Information',
                        icon: 'info',
                    },
                    {
                        label: 'Stream Explorer',
                        icon: 'view module',
                    },
                    {
                        label: 'Cinst',
                        icon: 'timeline',
                    },
                    {
                        label: 'Vrx',
                        icon: 'timeline',
                    },
                    {
                        label: 'Tvd',
                        icon: 'timeline',
                    },
                    {
                        label: 'RTP',
                        icon: 'timeline',
                    },
                    {
                        label: 'Per-frame',
                        icon: 'timeline',
                    },
                ]}
                onTabChange={setTabIndex}
            >
                <Scrollbars>
                    <CurrentTabComponent {...props} />
                </Scrollbars>
            </Tabs>
        </div>
    );
};

export default VideoPage;
