import React from 'react';
import { LineGraphic } from 'components/index';
import '../styles.scss';
import SDK from '@bisect/ebu-list-sdk';
import VideoStreamExplorerDisplay from './Video/VideoStreamExplorerDisplay';
import AudioStreamExplorerDisplay from './Audio/AudioStreamExplorerDisplay';
import AncillaryStreamExplorerDisplay from './Ancillary/AncillaryStreamExplorerDisplay';
import TtmlStreamExplorerDisplay from './Ttml/TtmlStreamExplorerDisplay';

const getPcapType = (
    currentStream: SDK.types.IStreamInfo | undefined,
    pcapID: string,
    pcap: SDK.types.IPcapInfo | undefined
) => {
    switch (currentStream?.media_type) {
        case 'video':
            return (
                <div className="pcap-details-page-image-gallery-container ">
                    {pcap?.truncated ? (
                        <div className="truncated-stream-explorer-div">
                            This stream is part of a truncated PCAP file, therefore the content is not suitable for
                            display.
                        </div>
                    ) : (
                        <VideoStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                    )}
                </div>
            );
        case 'audio':
            return (
                <div className="pcap-details-page-audio-player-container ">
                    {pcap?.truncated ? (
                        <div className="truncated-stream-explorer-div">
                            This stream is part of a truncated PCAP file, therefore the content is not suitable for
                            display.
                        </div>
                    ) : (
                        <AudioStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                    )}
                </div>
            );
        case 'ancillary_data':
            return (
                <div className="pcap-details-page-ancillary-data-container ">
                    {pcap?.truncated ? (
                        <div className="truncated-stream-explorer-div">
                            This stream is part of a truncated PCAP file, therefore the content is not suitable for
                            display.
                        </div>
                    ) : (
                        <AncillaryStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                    )}
                </div>
            );
        case 'ttml':
            return (
                <div className="pcap-details-page-ttml">
                    {pcap?.truncated ? (
                        <div className="truncated-stream-explorer-div">
                            This stream is part of a truncated PCAP file, therefore the content is not suitable for
                            display.
                        </div>
                    ) : (
                        <TtmlStreamExplorerDisplay currentStream={currentStream} pcapID={pcapID} />
                    )}
                </div>
            );
    }
};

function PcapDetailsStreamExplorerPage({
    currentStream,
    pcapID,
    pcap,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
    pcap: SDK.types.IPcapInfo | undefined;
}) {
    return <div className="pcap-details-page-container">{getPcapType(currentStream, pcapID, pcap)}</div>;
}

export default PcapDetailsStreamExplorerPage;
