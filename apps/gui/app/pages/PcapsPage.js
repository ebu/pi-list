import React from 'react';
import PcapList from '../containers/PcapList';
import NetworkCaptureUploader from '../components/NetworkCaptureUploader';
import { translateX } from '../utils/translation';
import SimpleMessage from '../components/SimpleMessage';

const noData = () => (
    <div className="lst-table-loading-data col-xs-12 center-xs lst-table-nodata">
        <SimpleMessage icon="do not disturb" message={translateX('pcap.no_pcaps')} />
    </div>
);

const PcapsPage = () => (
    <div className="row">
        <div className="col-xs-12">
            <NetworkCaptureUploader title={translateX('workflow.import_networkcapture')}>
                <PcapList noDataComponent={noData} />
            </NetworkCaptureUploader>
        </div>
    </div>
);

export default PcapsPage;
