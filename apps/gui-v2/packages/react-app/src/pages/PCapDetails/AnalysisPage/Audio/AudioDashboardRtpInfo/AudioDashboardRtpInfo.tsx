import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { translate } from 'utils/translation';
import { getComplianceSummary } from 'utils/stats';
import DeltaPacketVsRTPDisplay from './DeltaPacketVsRTPDisplay';
import useSidebarInfo from 'utils/useSidebarInfo';

function AudioDashboardRtpInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const setInfo = useSidebarInfo();

    const deltaPktTsVsRtpTs = currentStream?.analyses.packet_ts_vs_rtp_ts || undefined;
    if (!deltaPktTsVsRtpTs) return null;

    const summary = [
        {
            labelTag: 'stream.compliance',
            ...getComplianceSummary([deltaPktTsVsRtpTs]),
        },
    ];

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
            {deltaPktTsVsRtpTs && (
                <div className="pcap-details-page-panels-container">
                    <DeltaPacketVsRTPDisplay deltaPktTsVsRtpTs={deltaPktTsVsRtpTs} setAdditionalInformation={setInfo} />
                </div>
            )}
        </>
    );
}

export default AudioDashboardRtpInfo;
