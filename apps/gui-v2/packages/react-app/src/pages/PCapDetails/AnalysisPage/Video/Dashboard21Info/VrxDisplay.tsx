import React from 'react';
import { getAverageFromHistogram, getLowestFromHistogram, getHighestFromHistogram } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
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

    const VrxData = {
        measurementData: {
            title: 'VRX',
            data: [
                {
                    labelTag: 'Min',
                    value: vrxmin,
                },
                {
                    labelTag: 'Avg',
                    value: vrxavg.toFixed(3),
                },
                {
                    labelTag: 'Max',
                    value: vrxpeak,
                },
            ],
        },
        unit: 'packets',
        attention: invalidVrx,
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
    return <MeasurementPassCriteriaDisplay displayData={VrxData} actions={actions} />;
};

export default VrxDisplay;
