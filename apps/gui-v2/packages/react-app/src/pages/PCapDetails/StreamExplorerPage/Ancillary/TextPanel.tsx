import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../../../utils/api';
import './styles.scss';

function TextPanel({
    subSubStream,
    index,
    path,
}: {
    subSubStream: SDK.api.pcap.IST2110SubSubstream;
    index: number;
    path: string;
}) {
    const [text, setText] = React.useState();
    list.stream.downloadText(path).then(result => {
        setText(result);
    });
    return (
        <div className="text-area">
            <label>{subSubStream.type}:</label>
            <textarea className="lst-textarea" value={text} readOnly></textarea>
        </div>
    );
}

export default TextPanel;
