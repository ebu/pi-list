import React from 'react';
import './styles.scss';
import Select from 'react-select';

function getTitleFor(stream: any, index: any) {
    switch (stream.media_type) {
        case 'video':
            return `ST 2110-20 Video #${index + 1}`;
        case 'audio':
            return `ST 2110-30 Audio #${index + 1}`;
        case 'ancillary_data':
            return `ST 2110-40 Ancillary Data #${index + 1}`;
        case 'ttml':
            return `TTML #${index + 1}`;
        case 'unknown':
            return `Unknown #${index + 1}`;

        default:
            return null;
    }
}

//TODO See what are the pcaps parameters and make the interface for it
function StreamSelector({ streams, selectedStreamId, onChange }: any) {
    const getFullTitleFor = (stream: any, index: any) =>
        `${getTitleFor(stream, index)} - ${stream.network_information.destination_address}`;

    const entries = streams.map((stream: any, index: any) => ({
        label: getFullTitleFor(stream, index),
        value: stream.id,
    }));

    const current = entries.find((stream: any) => stream.value === selectedStreamId);

    return (
        <div className="stream-selector-container">
            <span className="stream-comparison-panel-h3">Stream:</span>
            <div>
                <Select options={entries} onChange={onChange} value={current}></Select>
            </div>
        </div>
    );
}

export default StreamSelector;
