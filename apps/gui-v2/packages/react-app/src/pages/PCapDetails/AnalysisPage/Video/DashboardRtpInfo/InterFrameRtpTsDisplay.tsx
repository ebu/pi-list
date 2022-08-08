import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { propAsMinMaxAvg } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { IMeasurementData } from 'utils/measurements';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const InterFrameRtpTsDisplay = ({
    interFrameRtpDelta,
    setInfo,
}: {
    interFrameRtpDelta: SDK.api.pcap.IStreamAnalysis;
    setInfo: SetSidebarInfoType;
}) => {
    const interFrameRtpTsMeasurementData = propAsMinMaxAvg(interFrameRtpDelta?.details.range, 1);
    const interFrameRtpTsPassCriteriaData = interFrameRtpDelta?.details.limit;
    const measurementData: IMeasurementData = {
        title: labels.interFrameRtpTsTitle,
        data: [
            {
                label: 'Min',
                value: interFrameRtpTsMeasurementData.min,
                attention: interFrameRtpDelta?.result !== 'compliant',
            },
            {
                label: 'Avg',
                value: interFrameRtpTsMeasurementData.avg,
                attention: interFrameRtpDelta?.result !== 'compliant',
            },
            {
                label: 'Max',
                value: interFrameRtpTsMeasurementData.max,
                attention: interFrameRtpDelta?.result !== 'compliant',
            },
        ],
        unit: 'ticks',
    };

    const extraPanelData = {
        title: 'Range',
        units: 'ticks',
        content: [
            {
                label: 'Min',
                value: interFrameRtpTsPassCriteriaData.min,
            },
            {
                label: 'Max',
                value: interFrameRtpTsPassCriteriaData.max,
            },
        ],
    };

    const additionalInformation = (
        <div>
            <div className="extra-panel-information-container">
                <span className="extra-panel-information-header">{labels.interFrameRtpTsTitle}</span>
                <span className="extra-panel-information-title">Definition</span>
                <span className="extra-panel-information-value">{labels.interFrameRtpTsDefinition}</span>
            </div>
            <ExtraPanelInformation displayData={extraPanelData} />
        </div>
    );

    const actions = {
        onMouseEnter: () => {
            setInfo(additionalInformation);
        },
        onMouseLeave: () => {
            setInfo(additionalInformation);
        },
    };

    return <MeasurementPassCriteriaDisplay displayData={measurementData} actions={actions} />;
};

export default InterFrameRtpTsDisplay;
