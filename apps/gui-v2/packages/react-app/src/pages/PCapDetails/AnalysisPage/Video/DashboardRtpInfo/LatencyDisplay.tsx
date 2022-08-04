import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { nsPropAsMinMaxAvgUs } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
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
    const latencyData = {
        measurementData: {
            title: labels.videoLatencyTitle,
            data: [
                {
                    labelTag: 'Min',
                    value: latencyMeasurementData.min,
                },
                {
                    labelTag: 'Avg',
                    value: latencyMeasurementData.avg,
                },
                {
                    labelTag: 'Max',
                    value: latencyMeasurementData.max,
                },
            ],
        },
        unit: 'μs',
        attention: deltaPktTsVsRtpTs?.result !== 'compliant',
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
    return <MeasurementPassCriteriaDisplay displayData={latencyData} actions={actions} />;
};

export default LatencyDisplay;
