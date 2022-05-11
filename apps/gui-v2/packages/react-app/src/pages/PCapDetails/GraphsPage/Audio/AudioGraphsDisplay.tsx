import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import '../../styles.scss';
import Rtp from './Rtp';
import Tsdf from './Tsdf';
import PacketIntervalTimeGraph from '../Common/PacketIntervalTimeGraph';

function AudioGraphsDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return (
        <>
            <Rtp currentStream={currentStream} pcapID={pcapID} />
            <div className="pcap-details-page-line-graphic-container ">
                <Tsdf currentStream={currentStream} pcapID={pcapID} />
            </div>
            <PacketIntervalTimeGraph currentStream={currentStream} pcapID={pcapID} />
        </>
    );
}

export default AudioGraphsDisplay;
