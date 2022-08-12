import React from 'react';
import { translate } from 'utils/translation';
import { ExtraPanelInformation, MeasurementPassCriteriaDisplay } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import { IMeasurementData } from 'utils/measurements';

const MaxTsdfDisplay = ({
    analysis,
    setAdditionalInformation,
}: {
    analysis: any;
    setAdditionalInformation: SetSidebarInfoType;
}) => {
    const tsdf_max = analysis.max === null || analysis.max === undefined ? '---' : analysis.max;

    const measurementData: IMeasurementData = {
        title: 'TS-DF',
        data: [
            {
                label: 'Max',
                value: tsdf_max,
            },
        ],
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

    return <MeasurementPassCriteriaDisplay displayData={measurementData} actions={actions} />;
};

export default MaxTsdfDisplay;
