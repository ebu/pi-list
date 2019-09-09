import React, { useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Tabs from '../components/common/Tabs';
import AncillarySummary from './streamPage/AncillarySummary';
import AncillarySubStream from './streamPage/AncillarySubStream';

const AncillaryPage = props => {
    const streamInfo = props.streamInfo;
    const subStreams = streamInfo.media_specific.sub_streams;
    const TABS = [AncillarySummary].
        concat(subStreams.map((s,i) => {
                return AncillarySubStream;
            })
        );
    const [tabIndex, setTabIndex] = useState(0);
    const CurrentTabComponent = TABS[tabIndex];
    const headers = [ {
            label: 'Summary',
            icon: 'info'
        } ].
        concat(subStreams.map((s,i) => {
                return {
                    label: 'Sub stream ' + (i+1),
                    icon: 'assignment'
                }
            })
        );

    return (
        <div className='lst-stream-info-tab lst-full-height'>
            <Tabs
                headers={ headers }
                onTabChange={ setTabIndex }
            >
                <Scrollbars>
                    <CurrentTabComponent
                        index = {tabIndex-1}
                        { ...props }
                    />
                </Scrollbars>
            </Tabs>
        </div>
    );
};

export default AncillaryPage;
