import React from 'react';
import Panel from 'components/common/Panel';
import PcapUploader from 'components/PcapUploader';
import PcapList from 'containers/PcapList';
import FlowList from 'containers/live/FlowList';
import { translate } from 'utils/translation';
import { LiveFeature } from 'utils/liveFeature';
import RealTimeDataStatus from 'containers/live/RealTimeDataStatus';
import SdpUploader from 'components/SdpUploader';
import PCAPSubscriptionPanel from 'containers/live/PCAPSubscriptionPanel';

const Dashboard = () => (
    <React.Fragment>
        <div className="row">
            <Panel className="col-xs-12 col-md-3 col-lg-4" title={translate('workflow.import_pcap')}>
                <PcapUploader />
            </Panel>
            <Panel className="col-xs-12 col-md-9 col-lg-8" title={translate('headings.last_pcaps')}>
                <PcapList limit={10} />
            </Panel>
        </div>
        <LiveFeature>
            <div className="row">
                <Panel className="col-xs-12 col-md-3 col-lg-4" title={translate('workflow.capture_stream')}>
                    <SdpUploader />
                    <PCAPSubscriptionPanel />
                </Panel>
                <Panel
                    className="col-xs-12 col-md-9 col-lg-8"
                    title={translate('headings.last_flows')}
                    rightToolbar={<RealTimeDataStatus />}
                >
                    <FlowList limit={5} />
                </Panel>
            </div>
        </LiveFeature>

    </React.Fragment>

);

export default Dashboard;
