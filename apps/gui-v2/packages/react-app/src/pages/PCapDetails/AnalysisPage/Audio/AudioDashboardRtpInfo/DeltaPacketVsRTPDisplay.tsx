import SDK from '@bisect/ebu-list-sdk';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const DeltaPacketVsRTPDisplay = ({
    deltaPktTsVsRtpTs,
    setAdditionalInformation,
}: {
    deltaPktTsVsRtpTs: SDK.api.pcap.IStreamAnalysis;
    setAdditionalInformation: SetSidebarInfoType;
}) => {
    const deltaPacketVsRTPData = {
        measurementData: {
            title: labels.audioLatencyTitle,
            data: [
                {
                    labelTag: 'Min',
                    value: deltaPktTsVsRtpTs?.details.range.min.toFixed(1),
                },
                {
                    labelTag: 'Avg',
                    value: deltaPktTsVsRtpTs?.details.range.avg.toFixed(1),
                },
                {
                    labelTag: 'Max',
                    value: deltaPktTsVsRtpTs?.details.range.max.toFixed(1),
                },
            ],
        },
        unit: 'μs',
    };

    const extraPanelData = {
        title: 'Range',
        units: 'μs',
        content: [
            {
                label: 'Min',
                value: deltaPktTsVsRtpTs?.details.limit.min,
            },
            {
                label: 'Max Avg',
                value: deltaPktTsVsRtpTs?.details.limit.maxAvg,
            },
            {
                label: 'Max',
                value: deltaPktTsVsRtpTs?.details.limit.max,
            },
        ],
    };

    const additionalInformation = (
        <div>
            <div className="extra-panel-information-container">
                <span className="extra-panel-information-header">{labels.audioLatencyTitle}</span>
                <span className="extra-panel-information-title">Definition</span>
                <span className="extra-panel-information-value">{labels.audioLatencyDefinition}</span>
            </div>
            <ExtraPanelInformation displayData={extraPanelData} />
        </div>
    );

    const actions = {
        onMouseEnter: () => {
            setAdditionalInformation(additionalInformation);
        },
        onMouseLeave: () => {
            setAdditionalInformation(undefined);
        },
    };

    return <MeasurementPassCriteriaDisplay displayData={deltaPacketVsRTPData} actions={actions} />;
};

export default DeltaPacketVsRTPDisplay;
