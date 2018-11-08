import React, { Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Panel from 'components/common/Panel';
import NetworkInfo from 'containers/streamPage/NetworkInfo';
import Icon from 'components/common/Icon';
import { renderInformationList } from 'containers/streamPage/utils';
import { translate } from 'utils/translation';
import asyncLoader from 'components/asyncLoader';
import api from 'utils/api';
import {find} from 'lodash';

const AncillaryPage = (props) => {
    const streamInfo = props.streamInfo;
    const networkInfo = streamInfo.network_information;
    const statistics = streamInfo.statistics;
    const anc_streams = streamInfo.media_specific.streams;

    const availableAncTypes = props.availableAncOptions[0].value;

    return (
        <Scrollbars>
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12 col-md-4">
                        <NetworkInfo {...networkInfo} packet_count={statistics.packet_count} />
                    </div>
                    <div className="col-xs-12 col-md-8">
                        {
                            anc_streams.map((stream) => {
                                const type = find(availableAncTypes, { value: `${stream.did_sdid}` });

                                return (
                                    <Fragment>
                                        <h2>
                                            <Icon value="assignment" />
                                            <span>{translate('headings.anc')}</span>
                                        </h2>
                                        <hr />
                                        {renderInformationList([
                                            {
                                                key: "Type",
                                                value: type.label
                                            },
                                            {
                                                key: "DID_SDID",
                                                value: stream.did_sdid
                                            }
                                        ])}
                                    </Fragment>
                                );
                            })
                        }
                    </div>
                </div>
            </Panel>
        </Scrollbars>
    );
};

export default asyncLoader(AncillaryPage, {
    asyncRequests: {
        availableAncOptions: () => api.getAvailableAncillaryOptions(),
    }
});
