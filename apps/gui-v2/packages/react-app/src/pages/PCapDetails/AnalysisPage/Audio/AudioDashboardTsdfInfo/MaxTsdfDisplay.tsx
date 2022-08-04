import React from 'react';
import { translate } from 'utils/translation';
import { ExtraPanelInformation, MeasurementPassCriteriaDisplay } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';

const MaxTsdfDisplay = ({
    analysis,
    setAdditionalInformation,
}: {
    analysis: any;
    setAdditionalInformation: SetSidebarInfoType;
}) => {
    const tsdf_max = analysis.max === null || analysis.max === undefined ? '---' : analysis.max;

    const maximumTimestampedDelayFactorData = {
        measurementData: {
            title: translate('media_information.audio.tsdf_max'),
            data: [
                {
                    value: tsdf_max,
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
                label: 'Max',
                value: analysis.limit,
            },
        ],
    };

    const additionalInformation = (
        <div>
            <p className="extra-panel-information-header">Maximum TS-DF</p>
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

    return <MeasurementPassCriteriaDisplay displayData={maximumTimestampedDelayFactorData} actions={actions} />;
};

export default MaxTsdfDisplay;
