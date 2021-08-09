import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import './styles.scss';
import TextPanel from './TextPanel';

const subSubStreamToTextArea = (
    subSubStream: SDK.api.pcap.IST2110SubSubstream,
    pcapID: string,
    streamID: string | undefined,
    index: number
) => {
    const downloadPath = list.stream.downloadAncillaryUrl(pcapID, streamID, subSubStream.filename);

    return <TextPanel subSubStream={subSubStream} index={index} path={downloadPath} key={index} />;
};

function SubSubStreamDisplay({
    currentSubStream,
    pcapID,
    streamID,
}: {
    currentSubStream: SDK.api.pcap.IST2110Substream | undefined;
    pcapID: string;
    streamID: string | undefined;
}) {
    const subSubStreams = currentSubStream?.sub_sub_streams;
    if (subSubStreams === undefined) {
        return null;
    }

    return (
        <div className="sub-sub-streams-explorer">
            <div className="sub-sub-streams-explorer-container">
                <div className="sub-sub-streams-explorer-container-title">
                    <span>Payload</span>
                </div>
                <div className="sub-sub-streams-explorer-text-area-container">
                    {subSubStreams.map((subSubStream: SDK.api.pcap.IST2110SubSubstream, index: number) =>
                        subSubStreamToTextArea(subSubStream, pcapID, streamID, index)
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubSubStreamDisplay;
