import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Tabs from 'components/common/Tabs';
import VideoStreamInformation from 'containers/streamPage/VideoStreamInformation';
import CbufferAnalysis from 'containers/streamPage/CbufferAnalysis';
import VrxAnalysis from 'containers/streamPage/VrxAnalysis';
import VideoExplorer from 'containers/streamPage/VideoExplorer';
import PerFrameAnalysisViewer from 'containers/streamPage/PerFrameAnalysisViewer';
import RtpAnalysisViewer from 'containers/streamPage/RtpAnalysisViewer';

const TABS = [
    VideoStreamInformation,
    VideoExplorer,
    CbufferAnalysis,
    VrxAnalysis,
    RtpAnalysisViewer,
    PerFrameAnalysisViewer
];

class VideoPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tabIndex: 0
        };

        this.changeCurrentTabState = this.changeCurrentTabState.bind(this);
    }

    changeCurrentTabState(tabIndex) {
        this.setState({ tabIndex });
    }

    render() {
        const CurrentTabComponent = TABS[this.state.tabIndex];

        return (
            <div className="lst-stream-info-tab lst-full-height">
                <Tabs
                    headers={[
                        {
                            label: 'Information',
                            icon: 'info'
                        },
                        {
                            label: 'Stream Explorer',
                            icon: 'view module'
                        },
                        {
                            label: 'Cinst',
                            icon: 'timeline'
                        },
                        {
                            label: 'Vrx',
                            icon: 'timeline'
                        },
                        {
                            label: 'RTP',
                            icon: 'timeline'
                        },
                        {
                            label: 'Per-frame',
                            icon: 'timeline'
                        }
                    ]}
                    onTabChange={this.changeCurrentTabState}
                >
                    <Scrollbars>
                        <CurrentTabComponent {...this.props} />
                    </Scrollbars>
                </Tabs>
            </div>
        );
    }
}

export default VideoPage;
