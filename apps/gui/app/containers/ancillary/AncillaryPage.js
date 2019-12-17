import React, { useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Tabs from '../../components/common/Tabs';
import StreamInfo from './StreamInfo';
import AncillarySubStream from './SubStream';
import RtpCharts from './RtpCharts';

const AncillaryPage = (props) => {
    const streamInfo = props.streamInfo;
    const subStreams = typeof streamInfo.media_specific.sub_streams === 'undefined'
        ? []
        : streamInfo.media_specific.sub_streams;
    const constTABS = [StreamInfo, RtpCharts];
    const TABS = constTABS.concat(
        subStreams.map((s, i) => AncillarySubStream)
    );
    const [tabIndex, setTabIndex] = useState(0);
    const CurrentTabComponent = TABS[tabIndex];
    const headers = [
        {
            label: 'Summary',
            icon: 'info',
        },
        {
            label: 'RTP',
            icon: 'timeline',
        },
    ].concat(
        subStreams.map((s, i) => ({
            label: `Sub stream ${i + 1}`,
            icon: 'assignment',
        }))
    );

    return (
        <div className="lst-stream-info-tab lst-full-height">
            <Tabs headers={headers} onTabChange={setTabIndex}>
                <Scrollbars>
                    <CurrentTabComponent index={tabIndex - constTABS.length} {...props} />
                </Scrollbars>
            </Tabs>
        </div>
    );
};

export default AncillaryPage;
