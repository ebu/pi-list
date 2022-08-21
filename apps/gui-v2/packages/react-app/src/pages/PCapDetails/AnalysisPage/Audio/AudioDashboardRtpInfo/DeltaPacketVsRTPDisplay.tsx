import SDK from '@bisect/ebu-list-sdk';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { IMeasurementData, rangeToContentArray } from 'utils/measurements';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import MinMaxAvgRangeAdditionalInformation from 'pages/PCapDetails/AnalysisPage/MinMaxAvgRangeAdditionalInformation';
import * as labels from 'utils/labels';

const DeltaPacketVsRTPDisplay = ({
    deltaPktTsVsRtpTs,
    setAdditionalInformation,
    attention,
}: {
    deltaPktTsVsRtpTs: SDK.api.pcap.IAudioLatencyAnalysis;
    setAdditionalInformation: SetSidebarInfoType;
    attention: boolean;
}) => {
    if (!deltaPktTsVsRtpTs) return null;

    const measurementData: IMeasurementData = {
        title: labels.audioLatencyTitle,
        data: [
            {
                label: 'Min',
                value: deltaPktTsVsRtpTs.details.range.min.toFixed(1),
                attention,
            },
            {
                label: 'Avg',
                value: deltaPktTsVsRtpTs.details.range.avg.toFixed(1),
                attention,
            },
            {
                label: 'Max',
                value: deltaPktTsVsRtpTs.details.range.max.toFixed(1),
                attention,
            },
        ],
        unit: 'μs',
    };

    const actions = {
        onMouseEnter: () => {
            setAdditionalInformation(
                <MinMaxAvgRangeAdditionalInformation
                    title={labels.audioLatencyTitle}
                    definition={labels.audioLatencyDefinition}
                    limit={deltaPktTsVsRtpTs.details?.limit}
                />
            );
        },
        onMouseLeave: () => {
            setAdditionalInformation(undefined);
        },
    };

    return <MeasurementPassCriteriaDisplay displayData={measurementData} actions={actions} />;
};

export default DeltaPacketVsRTPDisplay;
