import React from 'react';
import PcapList from '../containers/PcapList';
import Panel from '../components/common/Panel';
import SdpUploader from '../components/SdpUploader';
import CapturePanel from '../containers/live/CapturePanel';
import { translateX } from '../utils/translation';
import { LiveFeature } from '../utils/AppContext';

const CapturePage = props => (
    <div className="row">
        <div className="col-xs-12 col-md-3 col-lg-4">
            <LiveFeature>
                <SdpUploader title={translateX('workflow.capture_stream')}>
                    <CapturePanel />
                </SdpUploader>
            </LiveFeature>
        </div>
        <div className="col-xs-12 col-md-9 col-lg-8">
            <Panel title={translateX('headings.last_pcaps')}>
                <PcapList />
            </Panel>
        </div>
    </div>
);

export default CapturePage;
