import React, { Fragment } from 'react';
import { find } from 'lodash';
import api from 'utils/api';
import asyncLoader from '../../components/asyncLoader';
import DataList from '../streamPage/components/DataList';
import InfoPane from '../streamPage/components/InfoPane';

const AncillarySummary = props => {
    const availableAncTypes = props.availableAncOptions[0].value;
    const streamInfo = props.streamInfo;
    const subStreams =
        typeof streamInfo.media_specific.sub_streams === 'undefined' ? [] : streamInfo.media_specific.sub_streams;
    const summary = subStreams.map((s, index) => {
        const type = find(availableAncTypes, { value: `${s.did_sdid}` });

        const values = [
            {
                label: 'ID',
                value: (index + 1).toString(),
            },
            {
                label: 'Type',
                value: type.label,
                attention: type.label === 'Unknown',
            },
        ];

        return (
            <Fragment key={`row-${index}`}>
                <DataList values={values} />
                <hr />
            </Fragment>
        );
    });

    return (
        <div>
            <InfoPane icon="assignment" headingTag="headings.anc_sub_stream" values={[]} />
            {summary}
        </div>
    );
};

export default asyncLoader(AncillarySummary, {
    asyncRequests: {
        availableAncOptions: () => api.getAvailableAncillaryOptions(),
    },
});
