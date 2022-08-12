import React from 'react';
import '../styles.scss';
import SDK from '@bisect/ebu-list-sdk';
import VideoRawGraphsDisplay from './Video/VideoRawGraphsDisplay';
import AudioGraphsDisplay from './Audio/AudioGraphsDisplay';
import AncillaryGraphsDisplay from './Ancillary/AncillaryGraphsDisplay';
import UnknownGraphsDisplay from './Unknown/UnknownGraphsDisplay';
import TtmlGraphsDisplay from './Ttml/TtmlGraphsDisplay';

const getPcapType = (currentStream: SDK.types.IStreamInfo | undefined, pcapID: string) => {
    if (currentStream === undefined) return null;

    switch (currentStream?.full_media_type) {
        case 'video/raw':
        case 'video/jxsv':
            return <VideoRawGraphsDisplay stream={currentStream} pcapID={pcapID} />;
        case 'audio/L16':
        case 'audio/L24':
            return <AudioGraphsDisplay currentStream={currentStream} pcapID={pcapID} />;
        case 'video/smpte291':
            return <AncillaryGraphsDisplay currentStream={currentStream} pcapID={pcapID} />;
        case 'application/ttml+xml':
            return <TtmlGraphsDisplay currentStream={currentStream} pcapID={pcapID} />;
        case 'unknown':
            return <UnknownGraphsDisplay currentStream={currentStream} pcapID={pcapID} />;
    }
};

function PcapDetailsGraphsPage({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return (
        <div className="pcap-details-page-container" key={currentStream?.id}>
            {getPcapType(currentStream, pcapID)}
        </div>
    );
}

export default PcapDetailsGraphsPage;
