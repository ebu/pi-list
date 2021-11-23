import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import CbufferAnalysis from './CbufferAnalysis';
import VrxAnalysis from './VrxAnalysis';
import FtpAnalysis from './FtpAnalysis';
import RtpAnalysis from './RtpAnalysis';
import PacketIntervalTimeGraph from '../Common/PacketIntervalTimeGraph';

import '../../styles.scss';
function VideoGraphsDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return (
        <>
            {/* <CbufferAnalysis currentStream={currentStream} pcapID={pcapID} />
            <VrxAnalysis currentStream={currentStream} pcapID={pcapID} />
            <div className="pcap-details-page-line-graphic-container ">
                <FtpAnalysis currentStream={currentStream} pcapID={pcapID} />
            </div>

            <RtpAnalysis currentStream={currentStream} pcapID={pcapID} /> */}
            <PacketIntervalTimeGraph currentStream={currentStream} pcapID={pcapID} />
        </>
    );
}

export default VideoGraphsDisplay;
