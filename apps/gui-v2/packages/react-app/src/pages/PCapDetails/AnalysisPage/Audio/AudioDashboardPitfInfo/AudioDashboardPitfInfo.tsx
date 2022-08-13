import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { translate } from 'utils/translation';
import PitDisplay from './PitDisplay';
import useSidebarInfo from 'utils/useSidebarInfo';
import { getComplianceSummary } from 'utils/stats';
import * as labels from 'utils/labels';

function AudioDashboardPitfInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const analysis = currentStream?.analyses.pit;
    if (!analysis) return null;
    console.log('STREAM');
    console.dir(analysis);
    const invalid = analysis.result !== 'compliant';

    const summary = [
        {
            labelTag: 'stream.compliance',
            ...getComplianceSummary([analysis]),
        },
    ];
    const setInfo = useSidebarInfo();

    return (
        <>
            <div className="audio-dashboard-summary-container">
                <div className="audio-dashboard-title">
                    <span>{labels.pitTitle}</span>
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
                <PitDisplay details={analysis.details} setAdditionalInformation={setInfo} attention={invalid} />
            </div>
        </>
    );
}

export default AudioDashboardPitfInfo;
