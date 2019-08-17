import React, { useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Tabs from '../../components/common/Tabs';
import Analysis from './Analysis';
import StreamExplorer from './StreamExplorer';
import RTP from './RTP';
import TSDF from './TSDF';

const TABS = [Analysis, StreamExplorer, RTP, TSDF];

const AudioPage = props => {
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
                        label: 'Player',
                        icon: 'music_video',
                    },
                    {
                        label: 'RTP',
                        icon: 'timeline',
                    },
                    {
                        label: 'TS-DF',
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

export default AudioPage;
