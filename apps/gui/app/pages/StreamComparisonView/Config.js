import React, { Component } from 'react';
import api from 'utils/api';
import { translateX } from '../../utils/translation';
import asyncLoader from '../../components/asyncLoader';
import StreamCard from '../../components/stream/StreamCard';
import InfoPane from '../../containers/streamPage/components/InfoPane';

const renderCard = (title, stream, description, index) => {
    return (
        <div className="col-sm-12" key={`stream-${index}`}>
            <StreamCard key={stream.id} {...stream} pcapID={stream.pcap} title={`${title} ${description}`} />
        </div>
    );
}

const ComparisonConfigPane = (props) => {
    const summary = [
        {
            labelTag: 'comparison.config.media_type',
            value: props.media_type,
        },
        {
            labelTag: 'comparison.config.comparison_type',
            value: translateX(`comparison.config.comparison_type.${props.comparison_type}`),
        }
    ]

    return (
        <div>
            <InfoPane
                icon='compare'
                headingTag='headings.config'
                values={summary}
            />
            <div className="col display-flex">
                {
                    renderCard(
                        translateX('comparison.config.reference'),
                        props.refStreamInfo,
                        props.comparison_type === 'crossCorrelation' ? `(channel ${props.main.channel})` : '',
                        1
                    )
                }
                <hr/>
                {
                    renderCard(
                        translateX('comparison.config.main'),
                        props.mainStreamInfo,
                        props.comparison_type === 'crossCorrelation' ? `(channel ${props.reference.channel})` : '',
                        0
                    )
                }
            </div>
        </div>
    );
};

export default asyncLoader(ComparisonConfigPane, {
    asyncRequests: {
        refStreamInfo: (props) => {
            return api.getStreamInformation(props.reference.pcap, props.reference.stream);
        },
        mainStreamInfo: (props) => {
            return api.getStreamInformation(props.main.pcap, props.main.stream);
        },
    },
});
