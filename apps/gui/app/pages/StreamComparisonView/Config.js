import React, { Component } from 'react';
import api from 'utils/api';
import { translateX } from '../../utils/translation';
import asyncLoader from '../../components/asyncLoader';
import StreamCard from '../../components/stream/StreamCard';
import InfoPane from '../../containers/streamPage/components/InfoPane';
import { getTitleFor } from '../../utils/mediaUtils';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';

const renderCard = (stream, description, index) => {
    const title = getTitleFor(stream, index);
    return (
        <div className="col-sm-12" key={`stream-${index}`}>
            <StreamCard id={stream.id} {...stream} pcapID={stream.pcap} title={`${title} ${description}`} />
        </div>
    );
}

const ComparisonConfigPane = (props) => {
    var summary = [
        {
            labelTag: translateX('comparison.type'),
            value: props.type,
        },
    ]

    if (props.type == workflowTypes.compareStreams) {
        summary = summary.concat(
            [
                {
                    labelTag: 'comparison.config.media_type',
                    value: props.media_type,
                },
                {
                    labelTag: 'comparison.config.comparison_type',
                    value: translateX(`comparison.config.comparison_type.${props.comparison_type}`),
                }
            ]);
    }

    return (
        <div className="col">
            <InfoPane
                icon='compare'
                headingTag='headings.config'
                values={summary}
            />
            <InfoPane
                headingTag={translateX('comparison.config.reference')}
                icon='note'
                values={[
                    {
                        labelTag: 'workflow.import_networkcapture_btn',
                        value: props.refPcap.file_name,
                    },
                ]}
            />
            {
                renderCard(
                    props.mainStreamInfo,
                    props.comparison_type === 'crossCorrelation' ? `(channel ${props.reference.channel})` : '',
                    0
                )
            }
            <InfoPane
                icon='note'
                headingTag={translateX('comparison.config.main')}
                values={[
                    {
                        labelTag: 'workflow.import_networkcapture_btn',
                        value: props.mainPcap.file_name,
                    },
                ]}
            />
            {
                renderCard(
                    props.refStreamInfo,
                    props.comparison_type === 'crossCorrelation' ? `(channel ${props.main.channel})` : '',
                    1
                )
            }
        </div>
    );
};

export default asyncLoader(ComparisonConfigPane, {
    asyncRequests: {
        refPcap: (props) => {
            return api.getPcap(props.reference.pcap);
        },
        mainPcap: (props) => {
            return api.getPcap(props.main.pcap);
        },
        refStreamInfo: (props) => {
            return api.getStreamInformation(props.reference.pcap, props.reference.stream);
        },
        mainStreamInfo: (props) => {
            return api.getStreamInformation(props.main.pcap, props.main.stream);
        },
    },
});
