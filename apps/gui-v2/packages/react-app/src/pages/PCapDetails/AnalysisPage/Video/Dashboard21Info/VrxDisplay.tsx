import React from 'react';
import { getAverageFromHistogram, getLowestFromHistogram, getHighestFromHistogram } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { IMeasurementData } from 'utils/measurements';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const VrxDisplay = ({
    globalVideoAnalysis,
    vrxAnalysis,
    setInfo,
}: {
    globalVideoAnalysis: any;
    vrxAnalysis: any;
    setInfo: SetSidebarInfoType;
}) => {
    const vrxmin = getLowestFromHistogram(globalVideoAnalysis.vrx.histogram);
    const vrxpeak = getHighestFromHistogram(globalVideoAnalysis.vrx.histogram);
    const vrxavg = getAverageFromHistogram(globalVideoAnalysis.vrx.histogram);
    const invalidVrx = vrxAnalysis.result !== 'compliant';

    const measurementData: IMeasurementData = {
        title: 'VRX',
        data: [
            {
                label: 'Min',
                value: vrxmin,
                attention: invalidVrx,
            },
            {
                label: 'Avg',
                value: vrxavg.toFixed(3),
                attention: invalidVrx,
            },
            {
                label: 'Max',
                value: vrxpeak,
                attention: invalidVrx,
            },
        ],
        unit: 'packets',
    };

    const extraPanelData = {
        title: 'Range',
        units: 'packets',
        content: [
            {
                label: 'Narrow',
                value: globalVideoAnalysis.vrx.vrx_full_narrow,
            },
            {
                label: 'Wide',
                value: globalVideoAnalysis.vrx.vrx_full_wide,
            },
        ],
    };

    const additionalInformation = (
        <div>
            <p className="extra-panel-information-header">{labels.vrxFull}</p>
            <ExtraPanelInformation displayData={extraPanelData} />
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

export default VrxDisplay;
