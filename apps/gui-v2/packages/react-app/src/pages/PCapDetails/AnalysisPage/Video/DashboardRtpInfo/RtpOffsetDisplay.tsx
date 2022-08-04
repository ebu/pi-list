import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { propAsMinMaxAvg } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const RtpOffsetDisplay = ({
    deltaRtpTsVsNTFrame,
    setInfo,
}: {
    deltaRtpTsVsNTFrame: SDK.api.pcap.IStreamAnalysis;
    setInfo: SetSidebarInfoType;
}) => {
    const rtpOffsetMeasurementData = propAsMinMaxAvg(deltaRtpTsVsNTFrame?.details.range);
    const rtpOffsetPassCriteriaData = deltaRtpTsVsNTFrame?.details.limit;
    const rtpOffsetData = {
        measurementData: {
            title: labels.rtpOffset,
            data: [
                {
                    labelTag: 'Min',
                    value: rtpOffsetMeasurementData.min,
                },
                {
                    labelTag: 'Avg',
                    value: rtpOffsetMeasurementData.avg,
                },
                {
                    labelTag: 'Max',
                    value: rtpOffsetMeasurementData.max,
                },
            ],
        },
        unit: 'ticks',
        attention: deltaRtpTsVsNTFrame?.result !== 'compliant',
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
    return <MeasurementPassCriteriaDisplay displayData={rtpOffsetData} actions={actions} />;
};

export default RtpOffsetDisplay;
