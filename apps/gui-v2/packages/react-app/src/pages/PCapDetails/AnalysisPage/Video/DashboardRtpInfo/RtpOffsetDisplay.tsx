import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { propAsMinMaxAvg } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { IMeasurementData } from 'utils/measurements';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const RtpOffsetDisplay = ({
    deltaRtpTsVsNTFrame,
    setInfo,
}: {
    deltaRtpTsVsNTFrame: SDK.api.pcap.IStreamAnalysis;
    setInfo: SetSidebarInfoType;
}) => {
    if (!deltaRtpTsVsNTFrame) return null;

    const rtpOffsetMeasurementData = propAsMinMaxAvg(deltaRtpTsVsNTFrame?.details.range);
    const rtpOffsetPassCriteriaData = deltaRtpTsVsNTFrame?.details.limit;
    const measurementData: IMeasurementData = {
        title: labels.rtpOffset,
        data: [
            {
                label: 'Min',
                value: rtpOffsetMeasurementData.min,
                attention: deltaRtpTsVsNTFrame?.result !== 'compliant',
            },
            {
                label: 'Avg',
                value: rtpOffsetMeasurementData.avg,
                attention: deltaRtpTsVsNTFrame?.result !== 'compliant',
            },
            {
                label: 'Max',
                value: rtpOffsetMeasurementData.max,
                attention: deltaRtpTsVsNTFrame?.result !== 'compliant',
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
                value: rtpOffsetPassCriteriaData.min,
            },
            {
                label: 'Max',
                value: rtpOffsetPassCriteriaData.max,
            },
        ],
    };

    const additionalInformation = (
        <div>
            <div className="extra-panel-information-container">
                <span className="extra-panel-information-header">{labels.rtpOffset}</span>
                <span className="extra-panel-information-title">Definition</span>
                <span className="extra-panel-information-value">{labels.rtpOffsetDefinition}</span>
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

export default RtpOffsetDisplay;
