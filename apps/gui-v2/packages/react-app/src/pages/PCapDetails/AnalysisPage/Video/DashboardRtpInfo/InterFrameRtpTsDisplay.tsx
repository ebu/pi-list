import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { nsPropAsMinMaxAvgUs, propAsMinMaxAvg, getComplianceSummary } from 'utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { translate } from 'utils/translation';
import { informationSidebarContentAtom } from 'store/gui/informationSidebar/informationSidebarContent';
import { useSetRecoilState } from 'recoil';
import { debounce } from 'lodash';
import LatencyDisplay from './LatencyDisplay';
import RtpOffsetDisplay from './RtpOffsetDisplay';
import useSidebarInfo from 'utils/useSidebarInfo';
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
    const interFrameRtpTsData = {
        measurementData: {
            title: labels.interFrameRtpTsTitle,
            data: [
                {
                    labelTag: 'Min',
                    value: interFrameRtpTsMeasurementData.min,
                },
                {
                    labelTag: 'Avg',
                    value: interFrameRtpTsMeasurementData.avg,
                },
                {
                    labelTag: 'Max',
                    value: interFrameRtpTsMeasurementData.max,
                },
            ],
        },
        unit: 'ticks',
        attention: interFrameRtpDelta?.result !== 'compliant',
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

    return <MeasurementPassCriteriaDisplay displayData={interFrameRtpTsData} actions={actions} />;
};

export default InterFrameRtpTsDisplay;
