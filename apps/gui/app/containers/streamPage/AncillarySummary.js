import React, { Fragment } from 'react';
import { find } from 'lodash';
import api from 'utils/api';
import asyncLoader from '../../components/asyncLoader';
import Button from '../../components/common/Button';
import DataList from './components/DataList';
import InfoPane from './components/InfoPane';
import NetworkInfo from './NetworkInfo';

const AncillarySummary = (props) => {
    const streamInfo = props.streamInfo;
    const subStreams = streamInfo.media_specific.sub_streams;
    const availableAncTypes = props.availableAncOptions[0].value;
    const summary = subStreams.map((s, i) => {
            const type = find(availableAncTypes, { value: `${s.did_sdid}` });

            const values = [
                {
                    label: 'ID',
                    value: (i+1).toString()
                },
                {
                    label: 'Type',
                    value: type.label
                },
            ];

            return (
                <Fragment>
                    <DataList values={ values } />
                    <hr />
                </Fragment>
            );
        })

    return (
        <div className='row lst-full-height'>
            <div className='col-xs-12 col-md-4'>
                <NetworkInfo stream={ props.streamInfo } />
                <Button
                        type="info"
                        label="Ancillary analysis explained"
                        onClick={() => {
                            window.open(
                                'https://github.com/ebu/pi-list/blob/master/docs/ancillary_data.md',
                                '_blank'
                            );
                        }}
                    />
            </div>
            <div className='col-xs-12 col-md-8'>
                <InfoPane
                    icon='assignment'
                    headingTag='headings.anc'
                    values={ [] }
                />
                { summary }
            </div>
        </div>
    );
};

export default asyncLoader(AncillarySummary, {
    asyncRequests: {
        availableAncOptions: () => api.getAvailableAncillaryOptions(),
    },
});
