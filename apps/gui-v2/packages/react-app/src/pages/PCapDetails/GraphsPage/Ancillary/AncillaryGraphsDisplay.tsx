import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import '../../styles.scss';
import RtpLineCharts from './RtpLineCharts';

function AncillaryGraphsDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return (
        <>
            <RtpLineCharts currentStream={currentStream} pcapID={pcapID} />
        </>
    );
}

export default AncillaryGraphsDisplay;
