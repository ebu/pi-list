import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import Tabs from '../../components/common/Tabs';
import StreamInfo from './StreamInfo';
// import AncillarySubStream from './SubStream';
import TTMLInfo from './TTMLInfo';

const TTMLPage = props => {
    const constTABS = [StreamInfo, TTMLInfo];
    const TABS = constTABS;
    const [tabIndex, setTabIndex] = useState(0);
    const CurrentTabComponent = TABS[tabIndex];
    const headers = [
        {
            label: 'Summary',
            icon: 'info',
        },
        {
            label: 'TTML Payload',
            icon: 'timeline',
        },
    ];

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

TTMLPage.propTypes = {
    streamInfo: PropTypes.object.isRequired,
};

TTMLPage.defaultProps = {};

export default TTMLPage;
