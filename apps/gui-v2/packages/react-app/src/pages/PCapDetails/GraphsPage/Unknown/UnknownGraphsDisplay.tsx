import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import '../../styles.scss';
import PacketIntervalTimeGraph from '../Common/PacketIntervalTimeGraph';

function UnknownGraphsDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return (
        <>
            <PacketIntervalTimeGraph currentStream={currentStream} pcapID={pcapID} />
        </>
    );
}

export default UnknownGraphsDisplay;
