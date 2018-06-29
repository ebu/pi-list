import React, { Component } from 'react';
import api from 'utils/api';
import { Scrollbars } from 'react-custom-scrollbars';
import asyncLoader from 'components/asyncLoader';
import StreamColumn from 'components/stream/StreamColumn';
import StreamCard from 'components/stream/StreamCard';
import PTPCard from 'components/stream/PTPCard';
import { getIcon } from 'utils/mediaUtils';
import { translate } from '../utils/translation';

class StreamList extends Component {
    renderColumn(title, icon, streams) {
        const { pcapID } = this.props.match.params;

        return (
            <StreamColumn title={title} icon={icon} >
                {
                    streams.map((stream, index) => {
                        return (
                            <StreamCard title={`Stream #${index + 1}`} {...stream} pcapID={pcapID} />
                        );
                    })
                }
            </StreamColumn>
        );
    }

    render() {
        const videoStreams = this.props.availableStreams.filter(elem => elem.media_type === 'video');
        const audioStreams = this.props.availableStreams.filter(elem => elem.media_type === 'audio');
        const metadataStreams = this.props.availableStreams.filter(elem => elem.media_type === 'ancillary_data');
        const unknownStreams = this.props.availableStreams.filter(elem => elem.media_type === 'unknown');
        const { pcapID } = this.props.match.params;

        return (
            <Scrollbars>
                <div className="lst-js-stream-list-page fade-in">
                    <div className="row">
                        <div className="col-xs-2">
                            <StreamColumn title="PTP" icon="timer" >
                                { this.props.pcap.offset_from_ptp_clock !== 0 ? <PTPCard pcapID={pcapID} /> : null }
                            </StreamColumn>
                        </div>
                        <div className="col-xs-8">
                            <div className="row">
                                <div className="col-xs-12 col-md-4">
                                    {this.renderColumn(translate('headings.video'), getIcon('video'), videoStreams)}
                                </div>
                                <div className="col-xs-12 col-md-4">
                                    {this.renderColumn(translate('headings.audio'), getIcon('audio'), audioStreams)}
                                </div>
                                <div className="col-xs-12 col-md-4">
                                    {this.renderColumn(translate('headings.anc'), getIcon('metadata'), metadataStreams)}
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-2">
                            {this.renderColumn(translate('headings.unknown'), getIcon('unknown'), unknownStreams)}
                        </div>
                    </div>
                </div>
            </Scrollbars>
        );
    }
}

export default asyncLoader(StreamList, {
    asyncRequests: {
        availableStreams: (props) => {
            const { pcapID } = props.match.params;

            return api.getStreamsFromPcap(pcapID);
        },
        pcap: (props) => {
            const { pcapID } = props.match.params;
            return api.getPcap(pcapID);
        }
    }
});
