import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { translate } from 'utils/translation';
import * as labels from 'utils/labels';
import CInstDisplay from './CInstDisplay';
import FptDisplay from './FptDisplay';
import GapDisplay from './GapDisplay';
import PitDisplay from './PitDisplay';
import VrxDisplay from './VrxDisplay';
import useSidebarInfo from 'utils/useSidebarInfo';

const getCompliance = (value: string) => {
    if (value === 'narrow') {
        return { value: 'N', units: '(narrow)' };
    } else if (value === 'narrow_linear') {
        return { value: 'NL', units: '(narrow linear)' };
    } else if (value === 'wide') {
        return { value: 'W', units: '(Wide)' };
    } else {
        return { value: 'Not compliant', attention: true };
    }
};

function Dashboard21Info({ stream }: { stream: SDK.types.IStreamInfo }) {
    const setInfo = useSidebarInfo();

    const isRawVideo = stream.full_media_type === 'video/raw';

    const globalVideoAnalysis = stream.global_video_analysis;

    if (!globalVideoAnalysis?.compliance) {
        return null;
    }

    const videoMediaSpecific = stream.media_specific as SDK.api.pcap.IST2110VideoInfo;
    const interPacketSpacing = stream.network_information.inter_packet_spacing;
    const gapData = interPacketSpacing && interPacketSpacing.after_m_bit;
    const interPacketData = interPacketSpacing && interPacketSpacing.regular;
    const complianceSummary = getCompliance(globalVideoAnalysis.compliance);
    const cinstAnalysis = stream.analyses['2110_21_cinst'];
    const vrxAnalysis = stream.analyses['2110_21_vrx'];
    const showFpt = videoMediaSpecific && isRawVideo;
    const showGapData = gapData && isRawVideo;

    const summaryValues: {
        labelTag: any;
        value: any;
        units?: string;
        attention?: boolean;
    }[] = [
        {
            labelTag: translate('stream.compliance'),
            value: complianceSummary.value,
            units: complianceSummary.units,
            attention: complianceSummary.attention,
        },
    ];

    if (isRawVideo) {
        summaryValues.push({
            labelTag: translate('media_information.video.read_schedule'),
            value:
                typeof videoMediaSpecific.schedule !== 'undefined'
                    ? videoMediaSpecific.schedule
                    : translate('headings.unknown'),
        });
        summaryValues.push({
            labelTag: labels.trs,
            value: globalVideoAnalysis.trs
                ? (globalVideoAnalysis.trs.trs_ns / 1000).toFixed(3) + ' µs'
                : translate('headings.unknown'),
        });
        summaryValues.push({
            labelTag: labels.troDefault,
            value: videoMediaSpecific
                ? (videoMediaSpecific.tro_default_ns / 1000).toFixed(3) + ' µs'
                : translate('headings.unknown'),
        });
    }

    return (
        <>
            <div className="video-dashboard-summary-container">
                <div className="video-dashboard-title">
                    <span>ST2110-21</span>
                </div>

                <div className="video-dashboard-rtp-info-summary-value-container">
                    {summaryValues.map((item, index) => (
                        <div key={index}>
                            <span className="video-dashboard-rtp-info-summary-title ">{item.labelTag}: </span>
                            <span
                                className={`video-dashboard-rtp-info-summary-value ${
                                    item.attention === true ? 'attention' : ''
                                }`}
                            >
                                {item.value} {item.units}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pcap-details-page-panels-container">
                {cinstAnalysis && globalVideoAnalysis && (
                    <CInstDisplay
                        cinstAnalysis={cinstAnalysis}
                        globalVideoAnalysis={globalVideoAnalysis}
                        setInfo={setInfo}
                    />
                )}
                {vrxAnalysis && globalVideoAnalysis && (
                    <VrxDisplay vrxAnalysis={vrxAnalysis} globalVideoAnalysis={globalVideoAnalysis} setInfo={setInfo} />
                )}
                {showFpt && <FptDisplay videoMediaSpecific={videoMediaSpecific} setInfo={setInfo} />}
                {showGapData && <GapDisplay gapData={gapData} setInfo={setInfo} />}
                {interPacketData && <PitDisplay interPacketData={interPacketData} setInfo={setInfo} />}
            </div>
        </>
    );
}

export default Dashboard21Info;
