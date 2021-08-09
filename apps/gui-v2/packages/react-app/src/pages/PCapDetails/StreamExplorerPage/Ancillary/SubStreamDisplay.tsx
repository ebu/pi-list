import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { SubStreamsExplorerDisplay } from '../../../../components';
import AncillaryAvailableOptions from '../../../../utils/data/ancillary_options.json';

const getSubStreamInfo = (subStream: SDK.api.pcap.IST2110Substream, type: string | undefined) => {
    const hex_did_sdid = subStream.did_sdid.toString(16);
    return [
        {
            label: 'Type',
            value: type,
            attention: type === undefined,
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
            value: subStream.line.toString(),
        },
        {
            label: 'Horizontal offset',
            value: subStream.offset.toString(),
        },
        {
            label: 'Payload errors',
            value: subStream.errors.toString(),
            attention: subStream.errors > 0,
        },
    ];
};

function SubStreamDisplay({
    currentSubStream,
    pcapID,
}: {
    currentSubStream: SDK.api.pcap.IST2110Substream | undefined;
    pcapID: string;
}) {
    if (currentSubStream === undefined) {
        return null;
    }
    const availableAncOptions = AncillaryAvailableOptions[0].value;
    const availableAncTypes = availableAncOptions.find(v => v.value === currentSubStream?.did_sdid.toString());
    const type = availableAncTypes?.label;

    return (
        <div className="sub-streams-explorer-container">
            <SubStreamsExplorerDisplay displayData={getSubStreamInfo(currentSubStream, type)} />
        </div>
    );
}

export default SubStreamDisplay;
