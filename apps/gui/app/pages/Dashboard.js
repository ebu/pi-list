import React from 'react';
import Panel from 'components/common/Panel';
import PcapUploader from 'components/PcapUploader';
import PcapList from "containers/PcapList";

const Dashboard = () => (
    <div className="row">
        <Panel className="col-xs-12 col-md-3 col-lg-4" title="Import PCAP files">
            <PcapUploader />
        </Panel>
        <Panel className="col-xs-12 col-md-9 col-lg-8" title="Last PCAPs">
            <PcapList showLastPcaps />
        </Panel>
    </div>
);

export default Dashboard;
