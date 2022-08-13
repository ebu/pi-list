import SDK from '@bisect/ebu-list-sdk';
import { MeasurementPassCriteriaDisplay } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import { IMeasurementData } from 'utils/measurements';
import * as labels from 'utils/labels';
import MinMaxAvgRangeAdditionalInformation from 'pages/PCapDetails/AnalysisPage/MinMaxAvgRangeAdditionalInformation';

const PitDisplay = ({
    details,
    setAdditionalInformation,
    attention,
}: {
    details: SDK.api.pcap.IAudioPitAnalysisDetails;
    setAdditionalInformation: SetSidebarInfoType;
    attention: boolean;
}) => {
    if (!details) return null;

    const measurementData: IMeasurementData = {
        title: labels.pitTitle,
        data: [
            {
                label: 'Min',
                value: details.range.min.toFixed(1),
                attention,
            },
            {
                label: 'Avg',
                value: details.range.avg.toFixed(1),
                attention,
            },
            {
                label: 'Max',
                value: details.range.max.toFixed(1),
                attention,
            },
        ],
        unit: details.range.unit,
    };

    const actions = {
        onMouseEnter: () => {
            setAdditionalInformation(
                <MinMaxAvgRangeAdditionalInformation
                    title={labels.pitTitle}
                    definition={labels.pitDefinition}
                    limit={details.limit}
                />
            );
        },
        onMouseLeave: () => {
            setAdditionalInformation(undefined);
        },
    };

    return <MeasurementPassCriteriaDisplay displayData={measurementData} actions={actions} />;
};

export default PitDisplay;
