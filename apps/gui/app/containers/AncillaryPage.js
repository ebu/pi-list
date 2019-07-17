import React, { Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Panel from 'components/common/Panel';
import NetworkInfo from '../containers/streamPage/NetworkInfo';
import asyncLoader from 'components/asyncLoader';
import api from 'utils/api';
import AncillaryInfo from './streamPage/AncillaryInfo';

const AncillaryPage = props => {
    const networkInfo = props.streamInfo.network_information;

    return (
        <Scrollbars>
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12 col-md-4">
                        <NetworkInfo stream={props.streamInfo} />
                    </div>
                    <div className="col-xs-12 col-md-8">
                        <AncillaryInfo {...props} />
                    </div>
                </div>
            </Panel>
        </Scrollbars>
    );
};

export default asyncLoader(AncillaryPage, {
    asyncRequests: {
        availableAncOptions: () => api.getAvailableAncillaryOptions(),
    },
});
