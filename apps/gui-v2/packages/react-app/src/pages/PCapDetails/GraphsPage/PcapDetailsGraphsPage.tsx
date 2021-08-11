import React from 'react';
import '../styles.scss';
import SDK from '@bisect/ebu-list-sdk';
import VideoGraphsDisplay from './Video/VideoGraphsDisplay';
import AudioGraphsDisplay from './Audio/AudioGraphsDisplay';
import AncillaryGraphsDisplay from './Ancillary/AncillaryGraphsDisplay';

const getPcapType = (currentStream: SDK.types.IStreamInfo | undefined, pcapID: string) => {
    switch (currentStream?.media_type) {
        case 'video':
            return <VideoGraphsDisplay currentStream={currentStream} pcapID={pcapID} />;
        case 'audio':
            return <AudioGraphsDisplay currentStream={currentStream} pcapID={pcapID} />;
        case 'ancillary_data':
            return <AncillaryGraphsDisplay currentStream={currentStream} pcapID={pcapID} />;
    }
};

function PcapDetailsGraphsPage({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return <div className="pcap-details-page-container">{getPcapType(currentStream, pcapID)}</div>;
}

export default PcapDetailsGraphsPage;
