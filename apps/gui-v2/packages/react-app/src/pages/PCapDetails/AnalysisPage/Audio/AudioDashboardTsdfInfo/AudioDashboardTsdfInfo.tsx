import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { translate } from 'utils/translation';
import MaxTsdfDisplay from './MaxTsdfDisplay';
import useSidebarInfo from 'utils/useSidebarInfo';

function AudioDashboardRtpInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const setInfo = useSidebarInfo();

    const analysis = currentStream?.global_audio_analysis?.tsdf;
    if (!analysis) return null;
    const invalid = analysis.result !== 'compliant';

    const summary = [
        {
            labelTag: 'stream.compliance',
            value: analysis.result,
            attention: invalid,
        },
    ];

    return (
        <>
            <div className="audio-dashboard-summary-container">
                <div className="audio-dashboard-title">
                    <span>EBU Timestamped Delay Factor (TS-DF)</span>
                </div>

                <div className="audio-dashboard-rtp-info-summary-value-container">
                    <span className="audio-dashboard-rtp-info-summary-title ">{translate(summary[0].labelTag)}: </span>
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
                <MaxTsdfDisplay analysis={analysis} setAdditionalInformation={setInfo} />
            </div>
        </>
    );
}

export default AudioDashboardRtpInfo;
