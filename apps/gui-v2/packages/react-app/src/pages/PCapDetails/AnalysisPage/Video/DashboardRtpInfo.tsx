import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { nsPropAsMinMaxAvgUs, propAsMinMaxAvg, getComplianceSummary } from '../../../../utils/stats';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from '../../../../components';
import { translate } from '../../../../utils/translation';
import { informationSidebarContentAtom } from '../../../../store/gui/informationSidebar/informationSidebarContent';
import { useSetRecoilState } from 'recoil';
import { debounce } from 'lodash';

function DashboardRtpInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const deltaPktTsVsRtpTs = currentStream?.analyses.packet_ts_vs_rtp_ts || undefined;
    const deltaRtpTsVsNTFrame = currentStream?.analyses.rtp_ts_vs_nt || undefined;
    const interFrameRtpDelta = currentStream?.analyses.inter_frame_rtp_ts_delta || undefined;
    const packet_count = currentStream?.analyses?.rtp_sequence?.details?.packet_count || 0;
    const setInformationSidebarContent = useSetRecoilState(informationSidebarContentAtom);
    const complianceSummary = getComplianceSummary([deltaPktTsVsRtpTs, deltaRtpTsVsNTFrame, interFrameRtpDelta]);

    const summaryValues = [
        {
            labelTag: 'stream.compliance',
            value: complianceSummary.value,
            attention: complianceSummary.attention,
        },
        {
            // Just to pad one line
            labelTag: 'media_information.rtp.packet_count',
            value: packet_count,
        },
    ];

    const handleOnMouseEnterOrLeave = (extraPanelInformation: undefined | React.ReactElement) => {
        setInformationSidebarContent(extraPanelInformation);
    };

    const debouncedMouseEnterOrLeave = debounce(handleOnMouseEnterOrLeave, 300);

    const LatencyDisplay = () => {
        const latencyMeasurementData = nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs?.details.range);
        const latencyPassCriteriaData = nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs?.details.limit);
        const latencyData = {
            measurementData: {
                title: 'Video latency',
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
        const actions = {
            onMouseEnter: () => {
                debouncedMouseEnterOrLeave(<ExtraPanelInformation displayData={extraPanelData} />);
            },
            onMouseLeave: () => {
                debouncedMouseEnterOrLeave(undefined);
            },
        };
        return <MeasurementPassCriteriaDisplay displayData={latencyData} actions={actions} />;
    };

    const RtpOffsetDisplay = () => {
        const rtpOffsetMeasurementData = propAsMinMaxAvg(deltaRtpTsVsNTFrame?.details.range);
        const rtpOffsetPassCriteriaData = deltaRtpTsVsNTFrame?.details.limit;
        const rtpOffsetData = {
            measurementData: {
                title: (
                    <>
                        <span>RTP</span>
                        <span style={{ verticalAlign: 'sub', fontSize: '0.75em' }}>offset</span>
                    </>
                ),
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
        const actions = {
            onMouseEnter: () => {
                debouncedMouseEnterOrLeave(<ExtraPanelInformation displayData={extraPanelData} />);
            },
            onMouseLeave: () => {
                debouncedMouseEnterOrLeave(undefined);
            },
        };
        return <MeasurementPassCriteriaDisplay displayData={rtpOffsetData} actions={actions} />;
    };

    const InterFrameRtpTsDisplay = () => {
        const interFrameRtpTsMeasurementData = propAsMinMaxAvg(interFrameRtpDelta?.details.range, 1);
        const interFrameRtpTsPassCriteriaData = interFrameRtpDelta?.details.limit;
        const interFrameRtpTsData = {
            measurementData: {
                title: translate('media_information.rtp.inter_frame_rtp_ts_delta'),
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
        const actions = {
            onMouseEnter: () => {
                debouncedMouseEnterOrLeave(<ExtraPanelInformation displayData={extraPanelData} />);
            },
            onMouseLeave: () => {
                debouncedMouseEnterOrLeave(undefined);
            },
        };

        return <MeasurementPassCriteriaDisplay displayData={interFrameRtpTsData} actions={actions} />;
    };

    return (
        <>
            <div className="video-dashboard-summary-container">
                <div className="video-dashboard-title">
                    <span>RTP</span>
                </div>

                <div className="video-dashboard-rtp-info-summary-value-container">
                    {summaryValues.map((item, index) => (
                        <div key={index}>
                            <span className="video-dashboard-rtp-info-summary-title ">
                                {translate(item.labelTag)}:{' '}
                            </span>
                            <span
                                className={`video-dashboard-rtp-info-summary-value ${
                                    item.attention === true ? 'attention' : ''
                                }`}
                            >
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pcap-details-page-panels-container">
                <LatencyDisplay />
                <RtpOffsetDisplay />
                <InterFrameRtpTsDisplay />
            </div>
        </>
    );
}

export default DashboardRtpInfo;
