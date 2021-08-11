import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import AudioPlayerDisplay from './AudioPlayerDisplay';

function AudioStreamExplorerDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return (
        <>
            <AudioPlayerDisplay currentStream={currentStream} pcapID={pcapID} />
        </>
    );
}

export default AudioStreamExplorerDisplay;
