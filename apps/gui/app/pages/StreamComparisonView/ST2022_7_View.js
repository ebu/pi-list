import React from 'react';
import api from 'utils/api';
import { translateX, translateC } from '../../utils/translation';
import asyncLoader from '../../components/asyncLoader';
import StreamCard from '../../components/stream/StreamCard';
import InfoPane from '../../containers/streamPage/components/InfoPane';
import MinAvgMaxDisplay from '../../containers/streamPage/components/MinAvgMaxDisplay';

const renderCard = (title, stream, index) => {
    return (
        <div className="col-sm-12" key={`stream-${index}`}>
            <StreamCard key={stream.id} {...stream} pcapID={stream.pcap} title={`${title}`} />
        </div>
    );
};

const ConfigPane = props => {
    return (
        <div>
            <InfoPane icon="compare" headingTag="headings.config" values={[]} />
            <div className="col display-flex">
                {renderCard(translateX('comparison.config.reference'), props.refStreamInfo, 1)}
                <hr />
                {renderCard(translateX('comparison.config.main'), props.mainStreamInfo, 0)}
            </div>
        </div>
    );
};

const ST2022_7_View = props => {
    const intersection = props.result.analysis.intersectionSizeInPackets;
    const intersectionPercentage =
        intersection === 0 ? 100 : (intersection / props.result.analysis.totalNumberOfPackets) * 100;
    const numberOfEqualPackets =
        intersection - props.result.analysis.numberOfDifferentPackets - props.result.analysis.numberOfMissingPackets;
    const differentPercentage =
        intersection === 0 ? 100 : (props.result.analysis.numberOfDifferentPackets / intersection) * 100;
    const missingPercentage =
        intersection === 0 ? 100 : (props.result.analysis.numberOfMissingPackets / intersection) * 100;
    const equalPercentage = intersection == 0 ? 100 : (numberOfEqualPackets / intersection) * 100;

    const summary = [
        {
            labelTag: 'workflow.st2022_7_analysis.totalNumberOfPackets',
            value: props.result.analysis.totalNumberOfPackets,
            units: 'packets',
        },
        {
            labelTag: 'workflow.st2022_7_analysis.intersectionSizeInPackets',
            value: `${intersection} (${intersectionPercentage.toFixed(2)}%)`,
            units: 'packets',
        },
        {
            labelTag: 'workflow.st2022_7_analysis.numberOfDifferentPackets',
            value: `${props.result.analysis.numberOfDifferentPackets} (${differentPercentage.toFixed(2)}%)`,
            units: 'packets',
        },
        {
            labelTag: 'workflow.st2022_7_analysis.numberOfMissingPackets',
            value: `${props.result.analysis.numberOfMissingPackets} (${missingPercentage.toFixed(2)}%)`,
            units: 'packets',
        },
        {
            labelTag: 'workflow.st2022_7_analysis.numberOfEqualPackets',
            value: `${numberOfEqualPackets} (${equalPercentage.toFixed(2)}%)`,
            units: 'packets',
        },
    ];

    return (
        <div>
            <div className="row">
                <div className="col-xs-12 col-md-4">
                    <ConfigPane refStreamInfo={props.refStreamInfo} mainStreamInfo={props.mainStreamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <InfoPane icon="compare" headingTag="media_information.analysis" values={summary} />
                    <MinAvgMaxDisplay
                        labelTag="workflow.st2022_7_analysis.deltaBetweenPackets"
                        units="ns"
                        min={props.result.analysis.minDeltaNs.toFixed(0)}
                        avg={props.result.analysis.averageDeltaNs.toFixed(0)}
                        max={props.result.analysis.maxDeltaNs.toFixed(0)}
                    />
                </div>
            </div>
        </div>
    );
};

const ST2022_7_ViewSelector = props => {
    if (props.result.succeeded) {
        return <ST2022_7_View {...props} />;
    }

    return <div>Error: {props.result.message}</div>;
};

export default asyncLoader(ST2022_7_ViewSelector, {
    asyncRequests: {
        refStreamInfo: props => {
            return api.getStreamInformation(props.config.reference.pcap, props.config.reference.stream);
        },
        mainStreamInfo: props => {
            return api.getStreamInformation(props.config.main.pcap, props.config.main.stream);
        },
    },
});
