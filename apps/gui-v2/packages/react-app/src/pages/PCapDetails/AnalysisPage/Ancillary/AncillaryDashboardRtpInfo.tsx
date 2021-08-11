import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from '../../../../components';
import { nsPropAsMinMaxAvgUs, propAsMinMaxAvg, getComplianceSummary } from '../../../../utils/stats';
import { translate } from '../../../../utils/translation';
import './styles.scss';
import { informationSidebarContentAtom } from '../../../../store/gui/informationSidebar/informationSidebarContent';
import { useSetRecoilState } from 'recoil';
import { debounce } from 'lodash';

function AncillaryDashboardRtpInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const pktsPerFrame = currentStream?.analyses.pkts_per_frame || undefined;
    const deltaPktTsVsRtpTs = currentStream?.analyses.packet_ts_vs_rtp_ts || undefined;
    const interFrameRtpDelta = currentStream?.analyses.inter_frame_rtp_ts_delta || undefined;
    const setInformationSidebarContent = useSetRecoilState(informationSidebarContentAtom);

    const summary = [
        {
            labelTag: translate('stream.compliance'),
            ...getComplianceSummary([pktsPerFrame, deltaPktTsVsRtpTs, interFrameRtpDelta]),
        },
    ];

    const handleOnMouseEnterOrLeave = (extraPanelInformation: undefined | React.ReactElement) => {
        setInformationSidebarContent(extraPanelInformation);
    };

    const debouncedMouseEnterOrLeave = debounce(handleOnMouseEnterOrLeave, 300);

    const PacketsPerFrameDisplay = () => {
        const packetsPerFrameMeasurementData = propAsMinMaxAvg(pktsPerFrame?.details.range, 1);
        const packetsPerFrameData = {
            measurementData: {
                title: translate('media_information.video.packets_per_frame'),
                data: [
                    {
                        labelTag: 'Min',
                        value: packetsPerFrameMeasurementData.min,
                    },
                    {
                        labelTag: 'Max',
                        value: packetsPerFrameMeasurementData.max,
                    },
                ],
            },
            unit: pktsPerFrame?.details.unit,
            attention: pktsPerFrame?.result !== 'compliant',
        };

        const extraPanelData = {
            title: 'Range',
            units: pktsPerFrame?.details.unit,
            content: [
                {
                    label: 'Min',
                    value: pktsPerFrame?.details.limit.min,
                },
                {
                    label: 'Max',
                    value: '----',
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

        return <MeasurementPassCriteriaDisplay displayData={packetsPerFrameData} actions={actions} />;
    };

    const LatencyDisplay = () => {
        const latencyMeasurementData = nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs?.details.range);
        const latencyPassCriteriaData = nsPropAsMinMaxAvgUs(deltaPktTsVsRtpTs?.details.limit);
        const latencyData = {
            measurementData: {
                title: translate('media_information.rtp.delta_first_packet_time_vs_rtp_time'),
                data: [
                    {
                        labelTag: 'Min',
                        value: latencyMeasurementData.min,
                    },
                    {
                        labelTag: 'Max',
                        value: latencyMeasurementData.max,
                    },
                ],
            },
            unit: 'us',
            attention: deltaPktTsVsRtpTs?.result !== 'compliant',
        };

        const extraPanelData = {
            title: 'Range',
            units: 'us',
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
            <div className="ancillary-dashboard-summary-container">
                <div className="ancillary-dashboard-title">
                    <span>RTP</span>
                </div>
                <div className="ancillary-dashboard-rtp-info-summary-value-container">
                    <span className="ancillary-dashboard-rtp-info-summary-title ">{summary[0].labelTag}: </span>
                    <span
                        className={`ancillary-dashboard-rtp-info-summary-value ${
                            summary[0].attention === true ? 'attention' : ''
                        }`}
                    >
                        {summary[0].value}
                    </span>
                </div>
            </div>
            <div className="pcap-details-page-panels-container">
                <PacketsPerFrameDisplay />
                <LatencyDisplay />
                <InterFrameRtpTsDisplay />
            </div>
        </>
    );
}

export default AncillaryDashboardRtpInfo;
