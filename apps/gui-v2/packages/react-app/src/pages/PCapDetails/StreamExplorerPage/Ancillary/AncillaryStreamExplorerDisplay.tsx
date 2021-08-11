import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import SubStreamDisplay from './SubStreamDisplay';
import SubSubStreamDisplay from './SubSubStreamDisplay';
import './styles.scss';
import SubHeaderAnc from './SubHeaderAnc';

const getCategories = (subStreams: SDK.api.pcap.IST2110Substream[] | undefined) => {
    const dataArray: any = [];
    subStreams?.map((item, index) => {
        const data = {
            label: 'SubStream ' + (index + 1),
            index: index,
            clicked: false,
        };
        dataArray.push(data);
    });
    return dataArray;
};

function AncillaryStreamExplorerDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    const ancMediaSpecific = currentStream?.media_specific as SDK.api.pcap.IST2110AncInfo;
    const subStreams = typeof ancMediaSpecific.sub_streams === 'undefined' ? [] : ancMediaSpecific.sub_streams;
    const streamID = currentStream?.id;
    const [currentIndexSubStream, setIndexCurrentSubStream] = React.useState<number>(0);

    const categoriesList = getCategories(subStreams);

    const categories = categoriesList.map((item: any, index: number) => ({
        label: item.label,
        index: item.index,
        clicked: index === currentIndexSubStream,
    }));

    const onClick = (indexClicked: number): void => {
        setIndexCurrentSubStream(indexClicked);
    };

    return (
        <div className="anc-stream-explorer-container">
            <SubHeaderAnc onClick={onClick} categories={categories} />
            <SubStreamDisplay currentSubStream={subStreams[currentIndexSubStream]} pcapID={pcapID} />
            <SubSubStreamDisplay
                currentSubStream={subStreams[currentIndexSubStream]}
                pcapID={pcapID}
                streamID={streamID}
            />
        </div>
    );
}

export default AncillaryStreamExplorerDisplay;
