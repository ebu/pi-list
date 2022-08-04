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
import InterFrameRtpTsDisplay from './InterFrameRtpTsDisplay';
import useSidebarInfo from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

function DashboardRtpInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const setInfo = useSidebarInfo();

    const deltaPktTsVsRtpTs = currentStream?.analyses.packet_ts_vs_rtp_ts || undefined;
    const deltaRtpTsVsNTFrame = currentStream?.analyses.rtp_ts_vs_nt || undefined;
    const interFrameRtpDelta = currentStream?.analyses.inter_frame_rtp_ts_delta || undefined;
    const packet_count = currentStream?.analyses?.rtp_sequence?.details?.packet_count || 0;
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

    return (
        <>
            <div className="video-dashboard-summary-container">
                <div className="video-dashboard-title">
                    <span>RTP</span>
                </div>

                <div className="video-dashboard-rtp-info-summary-value-container">
                    {summaryValues.map((item, index) => (
                        <div key={index}>
                            <span className="video-dashboard-rtp-info-summary-title ">{translate(item.labelTag)}:</span>
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
                {deltaPktTsVsRtpTs && <LatencyDisplay deltaPktTsVsRtpTs={deltaPktTsVsRtpTs} setInfo={setInfo} />}
                {deltaRtpTsVsNTFrame && (
                    <RtpOffsetDisplay deltaRtpTsVsNTFrame={deltaRtpTsVsNTFrame} setInfo={setInfo} />
                )}
                {interFrameRtpDelta && (
                    <InterFrameRtpTsDisplay interFrameRtpDelta={interFrameRtpDelta} setInfo={setInfo} />
                )}
            </div>
        </>
    );
}

export default DashboardRtpInfo;
