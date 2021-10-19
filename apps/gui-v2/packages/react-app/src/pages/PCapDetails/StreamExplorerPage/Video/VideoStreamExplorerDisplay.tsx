import React from 'react';
import SDK, { api } from '@bisect/ebu-list-sdk';
import ImageGalleryStreamExplorer from './ImageGalleryStreamExplorer';
import list from '../../../../utils/api';

enum WaitForFramesStates {
    waiting,
    completed,
    failed,
}

// returns false while frames are not ready. True otherwise.
function useWaitForFrames(pcapId: string, streamId: string): WaitForFramesStates {
    const [framesAreReady, setFramesAreReady] = React.useState(WaitForFramesStates.waiting);
    const wsClient = list.wsClient;
    React.useEffect(() => {
        if (wsClient === (null || undefined)) {
            return;
        }

        const handleMessage = (msg: any) => {
            console.log(msg.event);
            if (msg.event === api.wsEvents.ExtractFrames.completed) {
                setFramesAreReady(WaitForFramesStates.completed);
            } else if (msg.event === api.wsEvents.ExtractFrames.active) {
                setFramesAreReady(WaitForFramesStates.waiting);
            } else if (msg.event === api.wsEvents.ExtractFrames.failed) {
                setFramesAreReady(WaitForFramesStates.failed);
            }
        };

        wsClient.on('message', handleMessage);

        const requestFrames = async (): Promise<void> => {
            const frames = await list.stream.requestFrames(pcapId, streamId);
        };
        requestFrames();

        return () => {
            wsClient.off('message', handleMessage);
        };
        // call api
    }, [pcapId, streamId, wsClient]);
    return framesAreReady;
}

function VideoStreamExplorerDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    if (currentStream === undefined) {
        return null;
    }

    const framesAreReady = useWaitForFrames(pcapID, currentStream.id);

    if (framesAreReady === WaitForFramesStates.waiting) {
        return (
            <div className="video-stream-explorer-waiting-frames">The frames for this stream are being rendered.</div>
        );
    }

    return (
        <>
            <ImageGalleryStreamExplorer
                currentStream={currentStream}
                pcapID={pcapID}
                cursorInitPos={0}
                onChange={() => {}}
            />
        </>
    );
}

export default VideoStreamExplorerDisplay;
