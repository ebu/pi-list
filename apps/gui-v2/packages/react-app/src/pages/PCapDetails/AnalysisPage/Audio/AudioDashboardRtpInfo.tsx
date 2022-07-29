import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { MeasurementPassCriteriaDisplay } from '../../../../components';
import { translate } from '../../../../utils/translation';
import { getComplianceSummary } from '../../../../utils/stats';
import './styles.scss';
import { informationSidebarContentAtom } from '../../../../store/gui/informationSidebar/informationSidebarContent';
import { useSetRecoilState } from 'recoil';
import { ExtraPanelInformation } from '../../../../components';
import { debounce } from 'lodash';

function AudioDashboardRtpInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const deltaPktTsVsRtpTs = currentStream?.analyses.packet_ts_vs_rtp_ts || undefined;
    const setInformationSidebarContent = useSetRecoilState(informationSidebarContentAtom);

    const summary = [
        {
            labelTag: 'stream.compliance',
            ...getComplianceSummary([deltaPktTsVsRtpTs]),
        },
    ];

    const handleOnMouseEnterOrLeave = (extraPanelInformation: undefined | React.ReactElement) => {
        setInformationSidebarContent(extraPanelInformation);
    };

    const debouncedMouseEnterOrLeave = debounce(handleOnMouseEnterOrLeave, 300);

    const DeltaPacketVsRTPDisplay = () => {
        const deltaPacketVsRTPData = {
            measurementData: {
                title: 'Audio latency',
                data: [
                    {
                        labelTag: 'Min',
                        value: deltaPktTsVsRtpTs?.details.range.min.toFixed(1),
                    },
                    {
                        labelTag: 'Avg',
                        value: deltaPktTsVsRtpTs?.details.range.avg.toFixed(1),
                    },
                    {
                        labelTag: 'Max',
                        value: deltaPktTsVsRtpTs?.details.range.max.toFixed(1),
                    },
                ],
            },
            unit: 'μs',
        };

        const extraPanelData = {
            title: 'Range',
            units: 'μs',
            content: [
                {
                    label: 'Min',
                    value: deltaPktTsVsRtpTs?.details.limit.min,
                },
                {
                    label: 'Max Avg',
                    value: deltaPktTsVsRtpTs?.details.limit.maxAvg,
                },
                {
                    label: 'Max',
                    value: deltaPktTsVsRtpTs?.details.limit.max,
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

        return <MeasurementPassCriteriaDisplay displayData={deltaPacketVsRTPData} actions={actions} />;
    };
    return (
        <>
            <div className="video-dashboard-summary-container">
                <div className="video-dashboard-title">
                    <span>RTP</span>
                </div>

                <div className="video-dashboard-rtp-info-summary-value-container">
                    <span className="video-dashboard-rtp-info-summary-title ">{translate(summary[0].labelTag)}: </span>
                    <span
                        className={`audio-dashboard-rtp-info-summary-value ${
                            summary[0].attention === true ? 'attention' : ''
                        }`}
                    >
                        {summary[0].value}
                    </span>
                </div>
            </div>
            <div className="pcap-details-page-panels-container">
                <DeltaPacketVsRTPDisplay />
            </div>
        </>
    );
}

export default AudioDashboardRtpInfo;
