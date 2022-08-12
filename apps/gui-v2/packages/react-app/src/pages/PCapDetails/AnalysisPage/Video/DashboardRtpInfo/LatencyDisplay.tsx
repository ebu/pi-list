import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { nsPropAsMinMaxAvgUs } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { IMeasurementData } from 'utils/measurements';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const LatencyDisplay = ({
    deltaPktTsVsRtpTs,
    setInfo,
}: {
    deltaPktTsVsRtpTs: SDK.api.pcap.IStreamAnalysis;
    setInfo: SetSidebarInfoType;
}) => {
    const latencyMeasurementData = nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs?.details.range);
    const latencyPassCriteriaData = nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs?.details.limit);
    const measurementData: IMeasurementData = {
        title: labels.videoLatencyTitle,
        data: [
            {
                label: 'Min',
                value: latencyMeasurementData.min,
                attention: deltaPktTsVsRtpTs?.result !== 'compliant',
            },
            {
                label: 'Avg',
                value: latencyMeasurementData.avg,
                attention: deltaPktTsVsRtpTs?.result !== 'compliant',
            },
            {
                label: 'Max',
                value: latencyMeasurementData.max,
                attention: deltaPktTsVsRtpTs?.result !== 'compliant',
            },
        ],
        unit: 'μs',
    };

    const extraPanelData = {
        title: 'Range',
        units: 'μs',
        content: [
            {
                label: 'Min',
                value: latencyPassCriteriaData.min,
            },
            {
                label: 'Max',
                value: latencyPassCriteriaData.max,
            },
        ],
    };

    const additionalInformation = (
        <div>
            <div className="extra-panel-information-container">
                <span className="extra-panel-information-header">{labels.videoLatencyTitle}</span>
                <span className="extra-panel-information-title">Definition</span>
                <span className="extra-panel-information-value">{labels.videoLatencyDefinition}</span>
            </div>
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

export default LatencyDisplay;
