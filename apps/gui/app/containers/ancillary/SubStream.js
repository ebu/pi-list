import React from 'react';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import InfoPane from '../streamPage/components/InfoPane';
import DataList from '../streamPage/components/DataList';
import asyncLoader from '../../components/asyncLoader';
import Textarea from '../../components/common/Textarea';

const AncillarySubStream = props => {
    const index = props.index;
    const subStream = props.streamInfo.media_specific.sub_streams[index];
    const availableAncTypes = props.availableAncOptions[0].value;
    const type = find(availableAncTypes, { value: `${subStream.did_sdid}` });
    const hex_did_sdid = subStream.did_sdid.toString(16);
    const line = subStream.line.toString();
    const offset = subStream.offset.toString();
    const error_count = subStream.errors.toString();
    const packet_count = subStream.packet_count.toString();
    const textareas =
        typeof subStream.sub_sub_streams === 'undefined'
            ? ''
            : subStream.sub_sub_streams.map((s, idx) => {
                  const downloadPath = api.downloadAncillaryUrl(props.pcapID, props.streamID, s.filename);
                  return (
                      <div key={`row-${idx}`} className="col-xs-12 col-md-4">
                          <Textarea title={s.type} downloadPath={downloadPath} />
                          {idx % 3 === 2 ? '' : <div className="w-100"></div>}
                      </div>
                  );
              });

    const values = [
        {
            label: 'Type',
            value: type.label,
        },
        {
            label: 'DID',
            value: `0x${hex_did_sdid.slice(0, 2)}`,
        },
        {
            label: 'SDID',
            value: `0x${hex_did_sdid.slice(2)}`,
        },
        {
            label: 'Line',
            value: line,
        },
        {
            label: 'Horizontal offset',
            value: offset,
        },
        {
            label: 'Payload errors',
            value: error_count,
        },
    ];
    return (
        <div className="row lst-full-height">
            <div className="col-xs-12 col-md-4">
                <InfoPane icon="assignment" headingTag="headings.anc" values={[]} />
                <DataList values={values} />
            </div>
            <div className="col-xs-12 col-md-8">
                <InfoPane icon="assignment" headingTag="headings.payload" values={[]} />
                <div className="row lst-full-height">{textareas}</div>
            </div>
        </div>
    );
};

AncillarySubStream.propTypes = {
    index: PropTypes.number,
};

AncillarySubStream.defaultProps = {
    index: 0,
};

export default asyncLoader(AncillarySubStream, {
    asyncRequests: {
        availableAncOptions: () => api.getAvailableAncillaryOptions(),
    },
});
