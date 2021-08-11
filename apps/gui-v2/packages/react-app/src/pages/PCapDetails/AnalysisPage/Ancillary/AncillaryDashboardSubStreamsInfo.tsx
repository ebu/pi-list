import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import AncillaryAvailableOptions from '../../../../utils/data/ancillary_options.json';
import { SubStreamsAnalysisDisplay } from '../../../../components';

function AncillaryDashboardSubStreamsInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const availableAncTypes = AncillaryAvailableOptions[0].value;
    const ancMediaSpecific = currentStream?.media_specific as SDK.api.pcap.IST2110AncInfo;
    const subStreams = typeof ancMediaSpecific.sub_streams === 'undefined' ? [] : ancMediaSpecific.sub_streams;
    const data: any = [];
    const summary = subStreams.map((s, index) => {
        const type = availableAncTypes.find(v => v.value === s.did_sdid.toString());

        const values = {
            id: (index + 1).toString(),
            type: type?.label,
        };
        data.push(values);
    });

    return (
        <>
            <div className="pcap-details-page-panels-container">
                <SubStreamsAnalysisDisplay displayData={data} />
            </div>
        </>
    );
}

export default AncillaryDashboardSubStreamsInfo;
