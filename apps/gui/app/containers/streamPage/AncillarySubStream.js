import React from 'react';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import InfoPane from './components/InfoPane';
import DataList from './components/DataList';
import asyncLoader from '../../components/asyncLoader';
import Textarea from '../../components/common/Textarea';

const AncillarySubStream = props => {
    const index = props.index;
    const subStream = props.streamInfo.media_specific.sub_streams[index];
    const availableAncTypes = props.availableAncOptions[0].value;
    const type = find(availableAncTypes, { value: `${ subStream.did_sdid }` });
    const hex_did_sdid = subStream.did_sdid.toString(16);
    const error_count = subStream.errors.toString();
    const packet_count = subStream.packet_count.toString();
    const textareas = typeof subStream.sub_sub_streams === 'undefined' ?
        '' : subStream.sub_sub_streams.map((s, i) => {
                const downloadPath = api.downloadAncillaryUrl(props.pcapID, props.streamID, s.filename);
                return (
                    <div className="col-xs-12 col-md-4">
                        <Textarea
                            title={ s.type }
                            downloadPath={ downloadPath }
                        />
                        { i%3 === 2? '': <div class="w-100"></div> }
                    </div>
                );
            });

    const values = [
        {
            label: 'Type',
            value: type.label
        },
        {
            label: 'DID',
            value: `0x${ hex_did_sdid.slice(0, 2) }`
        },
        {
            label: 'SDID',
            value: `0x${ hex_did_sdid.slice(2) }`
        },
        {
            label: 'Packets',
            value: packet_count
        },
        {
            label: 'Payload errors',
            value: error_count
        },
    ];
    return (
        <div className='row lst-full-height'>
            <div className='col-xs-12 col-md-4'>
                <InfoPane
                    icon='assignment'
                    headingTag='headings.anc'
                    values={ [] }
                />
                <DataList values={ values } />
            </div>
            <div className='col-xs-12 col-md-8'>
                <InfoPane
                    icon='assignment'
                    headingTag='headings.payload'
                    values={ [] }
                />
                <div className='row lst-full-height'>
                    { textareas }
                </div>
            </div>
        </div>
    );
};

AncillarySubStream.propTypes = {
    index: PropTypes.num,
};

AncillarySubStream.defaultProps = {
    index: 0,
};

export default asyncLoader(AncillarySubStream, {
    asyncRequests: {
        availableAncOptions: () => api.getAvailableAncillaryOptions(),
    },
});
