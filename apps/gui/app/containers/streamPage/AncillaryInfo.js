import React, { Fragment } from 'react';
import InfoPane from './components/InfoPane';
import { find } from 'lodash';
import DataList from './components/DataList';

const AncillaryInfo = props => {
    const streamInfo = props.streamInfo;
    const anc_streams = streamInfo.media_specific.streams;
    const availableAncTypes = props.availableAncOptions[0].value; // todo: change this

    return (
        <Fragment>
            <InfoPane
                icon="assignment"
                headingTag="headings.anc"
                values={[]}
            />
            {
                anc_streams.map((stream) => {
                    const type = find(availableAncTypes, { value: `${stream.did_sdid}` });
                    const hex_did_sdid = stream.did_sdid.toString(16);
                    const error_counter = stream.errors.toString();

                    const values = [
                        {
                            label: 'Type',
                            value: type.label
                        },
                        {
                            label: 'DID/SDID',
                            value: `${hex_did_sdid.slice(0, 2)}h/${hex_did_sdid.slice(2)}h`
                        },
                        {
                            label: 'Payload errors',
                            value: error_counter
                        },
                    ];

                    return (
                        <Fragment>
                            <DataList values={values} />
                            <hr />
                        </Fragment>
                    );
                })
            }
        </Fragment>
    );
};

export default AncillaryInfo;
