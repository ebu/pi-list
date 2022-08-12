import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import CbufferAnalysis from './CbufferAnalysis';
import VrxAnalysis from './VrxAnalysis';
import FtpAnalysis from './FtpAnalysis';
import RtpAnalysis from './RtpAnalysis';
import PacketIntervalTimeGraph from '../Common/PacketIntervalTimeGraph';
import '../../styles.scss';

const isRawVideo = (stream: SDK.types.IStreamInfo) => stream.full_media_type === 'video/raw';

function VideoRawGraphsDisplay({ stream, pcapID }: { stream: SDK.types.IStreamInfo; pcapID: string }) {
    const hasVrx = isRawVideo(stream);
    return (
        <>
            <CbufferAnalysis currentStream={stream} pcapID={pcapID} />
            {hasVrx && <VrxAnalysis currentStream={stream} pcapID={pcapID} />}
            {hasVrx && (
                <div className="pcap-details-page-line-graphic-container ">
                    <FtpAnalysis currentStream={stream} pcapID={pcapID} />
                </div>
            )}
            <RtpAnalysis currentStream={stream} pcapID={pcapID} />
            <PacketIntervalTimeGraph currentStream={stream} pcapID={pcapID} />
        </>
    );
}

export default VideoRawGraphsDisplay;
