import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { ImagesGallery } from 'components/index';
import list from '../../../../utils/api';

const getImages = (frames: any, pcapID: string, streamID: string | undefined) => {
    const imagesArray: any = [];
    frames.map((item: any) => {
        const timestamp = item.timestamp.toString();
        const url = list.stream.getUrlForFrame(pcapID, streamID, timestamp);
        const image = {
            original: url,
            thumbnail: url,
        };
        imagesArray.push(image);
    });
    return imagesArray;
};

function ImageGalleryStreamExplorer({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    const initial: SDK.types.IFrameInfo[] = [];

    const [frames, setFrames] = React.useState(initial);
    React.useEffect(() => {
        const loadFrames = async (): Promise<void> => {
            const frames = await list.stream.getFramesFromStream(pcapID, currentStream?.id);
            setFrames(frames);
        };
        loadFrames();

        console.log('useeffect', currentStream?.id);

        return () => {
            setFrames([]);
        };
    }, [currentStream?.id]);

    if (frames.length === 0) {
        return null;
    }

    return (
        <>
            <ImagesGallery imagesData={getImages(frames, pcapID, currentStream?.id)} />
        </>
    );
}

export default ImageGalleryStreamExplorer;
