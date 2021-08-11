import React from 'react';
import { LineGraphic } from 'components/index';
import '../styles.scss';
import SDK from '@bisect/ebu-list-sdk';
import VideoStreamExplorerDisplay from './Video/VideoStreamExplorerDisplay';
import AudioStreamExplorerDisplay from './Audio/AudioStreamExplorerDisplay';
import AncillaryStreamExplorerDisplay from './Ancillary/AncillaryStreamExplorerDisplay';

const lineGraphicData = {
    graphicData: [
        {
            value: 40,
            time: '16:19:37:100',
        },
        {
            value: 50,
            time: '16:19:38:100',
        },
        {
            value: 70,
            time: '16:19:39:100',
        },
        {
            value: 90,
            time: '16:19:50:100',
        },
        {
            value: 70,
            time: '16:19:45:100',
        },
        {
            value: 110,
            time: '16:19:53:100',
        },
        {
            value: 120,
            time: '16:19:55:100',
        },
    ],
    toleranceValue: 70,
};

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
