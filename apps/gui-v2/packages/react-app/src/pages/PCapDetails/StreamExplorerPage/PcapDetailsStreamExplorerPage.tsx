import React from 'react';
import { LineGraphic } from 'components/index';
import '../styles.scss';
import SDK from '@bisect/ebu-list-sdk';
import VideoStreamExplorerDisplay from './Video/VideoStreamExplorerDisplay';
import AudioStreamExplorerDisplay from './Audio/AudioStreamExplorerDisplay';
import AncillaryStreamExplorerDisplay from './Ancillary/AncillaryStreamExplorerDisplay';
import TtmlStreamExplorerDisplay from './Ttml/TtmlStreamExplorerDisplay';

const getPcapType = (currentStream: SDK.types.IStreamInfo | undefined, pcapID: string) => {
    switch (currentStream?.media_type) {
        case 'video':
            return (
                <div className="pcap-details-page-image-gallery-container ">
                    <VideoStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                </div>
            );
        case 'audio':
            return (
                <div className="pcap-details-page-audio-player-container ">
                    <AudioStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                </div>
            );
        case 'ancillary_data':
            return (
                <div className="pcap-details-page-ancillary-data-container ">
                    <AncillaryStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                </div>
            );
        case 'ttml':
            return (
                <div className="pcap-details-page-ttml">
                    <TtmlStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                </div>
            );
    }
};

function PcapDetailsStreamExplorerPage({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return <div className="pcap-details-page-container">{getPcapType(currentStream, pcapID)}</div>;
}

export default PcapDetailsStreamExplorerPage;
