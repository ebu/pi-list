import React, { Fragment } from 'react';
import { find } from 'lodash';
import api from 'utils/api';
import asyncLoader from '../../components/asyncLoader';
import DataList from './components/DataList';
import InfoPane from './components/InfoPane';

const AncillarySummary = (props) => {
    const availableAncTypes = props.availableAncOptions[0].value;
    const streamInfo = props.streamInfo;
    const subStreams = typeof streamInfo.media_specific.sub_streams === 'undefined' ?
        [] : streamInfo.media_specific.sub_streams;
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
        <div>
        <InfoPane
            icon='assignment'
            headingTag='headings.anc'
            values={ [] }
        />
        { summary }
        </div>
    );
};

export default asyncLoader(AncillarySummary, {
    asyncRequests: {
        availableAncOptions: () => api.getAvailableAncillaryOptions(),
    },
});
