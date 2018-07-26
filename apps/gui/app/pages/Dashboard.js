import React from 'react';
import Panel from 'components/common/Panel';
import PcapUploader from 'components/PcapUploader';
import PcapList from 'containers/PcapList';
import { translate } from 'utils/translation';

const Dashboard = () => (
    <div className="row">
        <Panel className="col-xs-12 col-md-3 col-lg-4" title={translate('workflow.import_pcap')}>
            <PcapUploader />
        </Panel>
        <Panel className="col-xs-12 col-md-9 col-lg-8" title={translate('headings.last_pcaps')}>
            <PcapList limit={10} />
        </Panel>
    </div>
);

export default Dashboard;
