import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import ImageGalleryStreamExplorer from './ImageGalleryStreamExplorer';

function VideoStreamExplorerDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return (
        <>
            <ImageGalleryStreamExplorer currentStream={currentStream} pcapID={pcapID} />
        </>
    );
}

export default VideoStreamExplorerDisplay;
