import React, { Component } from 'react';
import api from 'utils/api';
import { Scrollbars } from 'react-custom-scrollbars';
import asyncLoader from '../components/asyncLoader';
import StreamColumn from '../components/stream/StreamColumn';
import StreamCard from '../components/stream/StreamCard';
import PTPCard from '../components/stream/PTPCard';
import { getIcon } from '../utils/mediaUtils';
import { translateX } from '../utils/translation';

function renderColumn(pcapID, title, icon, streams) {
    return (
        <StreamColumn title={title}>
            {streams.map((stream, index) => {
                return (
                    <StreamCard
                        key={stream.id}
                        title={`Stream #${index + 1}`}
                        {...stream}
                        pcapID={pcapID}
                    />
                );
            })}
        </StreamColumn>
    );
}

const StreamList = props => {
    const videoStreams = props.availableStreams.filter(
        elem => elem.media_type === 'video'
    );
    const audioStreams = props.availableStreams.filter(
        elem => elem.media_type === 'audio'
    );
    const metadataStreams = props.availableStreams.filter(
        elem => elem.media_type === 'ancillary_data'
    );
    const unknownStreams = props.availableStreams.filter(
        elem => elem.media_type === 'unknown'
    );
    const { pcapID } = props.match.params;

    return (
        <Scrollbars>
            <div className="lst-js-stream-list-page fade-in">
                <div className="row">
                    <div className="col-xs-2">
                        <StreamColumn title="PTP">
                            {props.pcap.offset_from_ptp_clock !== 0 ? (
                                <PTPCard pcapID={pcapID} />
                            ) : null}
                        </StreamColumn>
                    </div>
                    <div className="col-xs-8">
                        <div className="row">
                            <div className="col-xs-12 col-md-4">
                                {renderColumn(
                                    pcapID,
                                    translateX('headings.video'),
                                    getIcon('video'),
                                    videoStreams
                                )}
                            </div>
                            <div className="col-xs-12 col-md-4">
                                {renderColumn(
                                    pcapID,
                                    translateX('headings.audio'),
                                    getIcon('audio'),
                                    audioStreams
                                )}
                            </div>
                            <div className="col-xs-12 col-md-4">
                                {renderColumn(
                                    pcapID,
                                    translateX('headings.anc'),
                                    getIcon('metadata'),
                                    metadataStreams
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-2">
                        {renderColumn(
                            pcapID,
                            translateX('headings.unknown'),
                            getIcon('unknown'),
                            unknownStreams
                        )}
                    </div>
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
