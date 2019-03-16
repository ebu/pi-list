import React from 'react';
import PcapList from '../containers/PcapList';
import PcapUploader from '../components/PcapUploader';
import { translate } from '../utils/translation';
import SimpleMessage from 'components/SimpleMessage';

const noData = () => (
    <div className="lst-table-loading-data col-xs-12 center-xs lst-table-nodata">
        <SimpleMessage icon="do not disturb" message={translate('pcap.no_pcaps')} />
    </div>
);

const PcapsPage = props => (
    <div className="row">
        <div className="col-xs-12">
            <PcapUploader title={translate('workflow.import_pcap')}>
                <PcapList noDataComponent={noData} />
            </PcapUploader>
        </div>
    </div>
);

export default PcapsPage;
