import React from 'react';
import { nsAsMicroseconds } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const FptDisplay = ({ videoMediaSpecific, setInfo }: { videoMediaSpecific: any; setInfo: SetSidebarInfoType }) => {
    const FptData = {
        measurementData: {
            title: 'FPT',
            data: [
                {
                    labelTag: 'Min',
                    value: nsAsMicroseconds(videoMediaSpecific.min_tro_ns),
                },
                {
                    labelTag: 'Avg',
                    value: nsAsMicroseconds(videoMediaSpecific.avg_tro_ns),
                },
                {
                    labelTag: 'Max',
                    value: nsAsMicroseconds(videoMediaSpecific.max_tro_ns),
                },
            ],
        },
        unit: 'μs',
    };

    const additionalInformation = (
        <div>
            <p className="extra-panel-information-header">First Packet Time</p>
            <p className="extra-panel-information-title">Definition</p>
            <p className="extra-panel-information-value">{labels.fptDefinition}</p>
        </div>
    );

    const actions = {
        onMouseEnter: () => {
            setInfo(additionalInformation);
        },
        onMouseLeave: () => {
            setInfo(undefined);
        },
    };
    return <MeasurementPassCriteriaDisplay displayData={FptData} actions={actions} />;
};

export default FptDisplay;
