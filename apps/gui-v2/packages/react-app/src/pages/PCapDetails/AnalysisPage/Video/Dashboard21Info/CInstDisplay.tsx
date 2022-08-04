import React from 'react';
import { getAverageFromHistogram, getLowestFromHistogram, getHighestFromHistogram } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import * as labels from 'utils/labels';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';

const CInstDisplay = ({
    globalVideoAnalysis,
    cinstAnalysis,
    setInfo,
}: {
    globalVideoAnalysis: any;
    cinstAnalysis: any;
    setInfo: SetSidebarInfoType;
}) => {
    const cmin = getLowestFromHistogram(globalVideoAnalysis.cinst.histogram);
    const cpeak = getHighestFromHistogram(globalVideoAnalysis.cinst.histogram);
    const cavg = getAverageFromHistogram(globalVideoAnalysis.cinst.histogram);
    const invalidCinst = cinstAnalysis.result !== 'compliant';

    const CInstData = {
        measurementData: {
            title: labels.cInst,
            data: [
                {
                    labelTag: 'Min',
                    value: cmin,
                },
                {
                    labelTag: 'Avg',
                    value: cavg.toFixed(3),
                },
                {
                    labelTag: 'Max',
                    value: cpeak,
                },
            ],
        },
        unit: 'packets',
        attention: invalidCinst,
    };

    const extraPanelData = {
        title: 'Range',
        units: 'packets',
        content: [
            {
                label: 'Narrow',
                value: globalVideoAnalysis.cinst.cmax_narrow,
            },
            {
                label: 'Wide',
                value: globalVideoAnalysis.cinst.cmax_wide,
            },
        ],
    };

    const additionalInformation = (
        <div>
            <p className="extra-panel-information-header">{labels.cMax}</p>
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
    return <MeasurementPassCriteriaDisplay displayData={CInstData} actions={actions} />;
};

export default CInstDisplay;
