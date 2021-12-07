import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import CbufferAnalysis from './CbufferAnalysis';
import VrxAnalysis from './VrxAnalysis';
import FtpAnalysis from './FtpAnalysis';
import RtpAnalysis from './RtpAnalysis';
import PacketIntervalTimeGraph from '../Common/PacketIntervalTimeGraph';

import '../../styles.scss';
function VideoJxsvGraphsDisplay({
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

export default VideoJxsvGraphsDisplay;
