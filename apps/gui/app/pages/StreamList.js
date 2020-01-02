import React, { Component } from 'react';
import api from 'utils/api';
import { Scrollbars } from 'react-custom-scrollbars';
import asyncLoader from '../components/asyncLoader';
import StreamCard from '../components/stream/StreamCard';
import PTPCard from '../components/stream/PTPCard';
import { getIcon } from '../utils/mediaUtils';

function get_icon_for(stream) {
    switch (stream.media_type) {
        case 'video':
            return getIcon('video');
        case 'audio':
            return getIcon('audio');
        case 'ancillary_data':
            return getIcon('metadata');
        case 'ttml_data':
            return getIcon('metadata');
        case 'unknown':
            return getIcon('unknown');

        default:
            return null;
    }
}

function renderPtpCard(pcapID) {
    return (
        <div className="col-lg-3 col-md-4 col-sm-12">
            <PTPCard pcapID={pcapID} />
        </div>
    );
}

function renderCard(pcapID, stream, index) {
    const icon = get_icon_for(stream);
    return (
        <div className="col-lg-3 col-md-4 col-sm-12" key={`stream-${index}`}>
            <StreamCard key={stream.id} {...stream} pcapID={pcapID} title={`#${index + 1}`} icon={icon} />
        </div>
    );
}

const StreamList = props => {
    const videoStreams = props.availableStreams.filter(elem => elem.media_type === 'video');
    const audioStreams = props.availableStreams.filter(elem => elem.media_type === 'audio');
    const metadataStreams = props.availableStreams.filter(elem => elem.media_type === 'ancillary_data');
    const ttmlStreams = props.availableStreams.filter(elem => elem.media_type === 'ttml_data');
    const unknownStreams = props.availableStreams.filter(elem => elem.media_type === 'unknown');
    const { pcapID } = props.match.params;
    const allStreams = [...videoStreams, ...audioStreams, ...metadataStreams, ...ttmlStreams, ...unknownStreams];

    return (
        <Scrollbars>
            <div className="lst-js-stream-list-page fade-in">
                <div className="row display-flex">
                    {props.pcap.offset_from_ptp_clock !== 0 && renderPtpCard(pcapID)}
                    {allStreams.map((stream, index) => renderCard(pcapID, stream, index))}
                </div>
            </div>
        </Scrollbars>
    );
};

export default asyncLoader(StreamList, {
    asyncRequests: {
        availableStreams: props => {
            const { pcapID } = props.match.params;

            return api.getStreamsFromPcap(pcapID);
        },
        pcap: props => {
            const { pcapID } = props.match.params;
            return api.getPcap(pcapID);
        },
    },
});
