import React from 'react';
import { nsAsMicroseconds } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import { IMeasurementData } from 'utils/measurements';
import * as labels from 'utils/labels';

const FptDisplay = ({ videoMediaSpecific, setInfo }: { videoMediaSpecific: any; setInfo: SetSidebarInfoType }) => {
    const measurementData: IMeasurementData = {
        title: 'FPT',
        data: [
            {
                label: 'Min',
                value: nsAsMicroseconds(videoMediaSpecific.min_tro_ns),
            },
            {
                label: 'Avg',
                value: nsAsMicroseconds(videoMediaSpecific.avg_tro_ns),
            },
            {
                label: 'Max',
                value: nsAsMicroseconds(videoMediaSpecific.max_tro_ns),
            },
        ],
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

    return <MeasurementPassCriteriaDisplay displayData={measurementData} actions={actions} />;
};

export default FptDisplay;
