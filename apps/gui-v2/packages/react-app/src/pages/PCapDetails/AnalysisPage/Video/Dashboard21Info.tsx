import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import {
    getAverageFromHistogram,
    getLowestFromHistogram,
    getHighestFromHistogram,
    nsAsMicroseconds,
} from '../../../../utils/stats';
import {
    MeasurementPassCriteriaDisplay,
    MeasurementMinAvgMaxDisplay,
    ExtraPanelInformation,
} from '../../../../components';
import { translate } from '../../../../utils/translation';
import './styles.scss';
import { useSetRecoilState } from 'recoil';
import { informationSidebarContentAtom } from '../../../../store/gui/informationSidebar/informationSidebarContent';
import { debounce } from 'lodash';

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

function Dashboard21Info({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const globalVideoAnalysis = currentStream?.global_video_analysis;
    const cmin = getLowestFromHistogram(globalVideoAnalysis.cinst.histogram);
    const cpeak = getHighestFromHistogram(globalVideoAnalysis.cinst.histogram);
    const cavg = getAverageFromHistogram(globalVideoAnalysis.cinst.histogram);
    const vrxmin = getLowestFromHistogram(globalVideoAnalysis.vrx.histogram);
    const vrxpeak = getHighestFromHistogram(globalVideoAnalysis.vrx.histogram);
    const vrxavg = getAverageFromHistogram(globalVideoAnalysis.vrx.histogram);
    const videoMediaSpecific = currentStream?.media_specific as SDK.api.pcap.IST2110VideoInfo;
    const invalidCinst = currentStream?.analyses['2110_21_cinst'].result !== 'compliant';
    const invalidVrx = currentStream?.analyses['2110_21_vrx'].result !== 'compliant';
    const interPacketSpacing = currentStream?.network_information.inter_packet_spacing;
    const gapData = interPacketSpacing && interPacketSpacing.after_m_bit;
    const interPacketData = interPacketSpacing && interPacketSpacing.regular;
    const setInformationSidebarContent = useSetRecoilState(informationSidebarContentAtom);
    const complianceSummary = getCompliance(globalVideoAnalysis.compliance);

    const summaryValues = [
        {
            labelTag: translate('stream.compliance'),
            value: complianceSummary.value,
            units: complianceSummary.units,
            attention: complianceSummary.attention,
        },
        {
            labelTag: translate('media_information.video.read_schedule'),
            value:
                typeof videoMediaSpecific.schedule !== 'undefined'
                    ? videoMediaSpecific.schedule
                    : translate('headings.unknown'),
        },
        {
            labelTag: 'Trs',
            value: globalVideoAnalysis.trs
                ? (globalVideoAnalysis.trs.trs_ns / 1000).toFixed(3) + ' µs'
                : translate('headings.unknown'),
        },
    ];

    const handleOnMouseEnterOrLeave = (extraPanelInformation: undefined | React.ReactElement) => {
        setInformationSidebarContent(extraPanelInformation);
    };

    const debouncedMouseEnterOrLeave = debounce(handleOnMouseEnterOrLeave, 300);

    const CInstDisplay = () => {
        const CInstData = {
            measurementData: {
                title: 'CInst',
                data: [
                    {
                        labelTag: 'Min',
                        value: cmin,
                    },
                    {
                        labelTag: 'Avg',
                        value: cavg.toFixed(3),
                    },
                    {
                        labelTag: 'Max',
                        value: cpeak,
                    },
                ],
            },
            unit: 'packets',
            attention: invalidCinst,
        };

        const extraPanelData = {
            title: 'CMax',
            units: 'packets',
            content: [
                {
                    label: 'Narrow',
                    value: globalVideoAnalysis.cinst.cmax_narrow,
                },
                {
                    label: 'Wide',
                    value: globalVideoAnalysis.cinst.cmax_wide,
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
        return <MeasurementPassCriteriaDisplay displayData={CInstData} actions={actions} />;
    };

    const VrxDisplay = () => {
        const VrxData = {
            measurementData: {
                title: 'VRX',
                data: [
                    {
                        labelTag: 'Min',
                        value: vrxmin,
                    },
                    {
                        labelTag: 'Avg',
                        value: vrxavg.toFixed(3),
                    },
                    {
                        labelTag: 'Max',
                        value: vrxpeak,
                    },
                ],
            },
            unit: 'packets',
            attention: invalidVrx,
        };

        const extraPanelData = {
            title: 'VRX Full',
            units: 'packets',
            content: [
                {
                    label: 'Narrow',
                    value: globalVideoAnalysis.vrx.vrx_full_narrow,
                },
                {
                    label: 'Wide',
                    value: globalVideoAnalysis.vrx.vrx_full_wide,
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
        return <MeasurementPassCriteriaDisplay displayData={VrxData} actions={actions} />;
    };

    const FptDisplay = () => {
        const FptData = {
            measurementData: {
                title: 'FPT',
                data: [
                    {
                        labelTag: 'Min',
                        value: nsAsMicroseconds(videoMediaSpecific.min_tro_ns),
                    },
                    {
                        labelTag: 'Avg',
                        value: nsAsMicroseconds(videoMediaSpecific.avg_tro_ns),
                    },
                    {
                        labelTag: 'Max',
                        value: nsAsMicroseconds(videoMediaSpecific.max_tro_ns),
                    },
                ],
            },
            unit: 'μs',
        };

        const extraPanelData = {
            title: 'TRO Default',
            units: 'μs',
            content: {
                value: nsAsMicroseconds(videoMediaSpecific.tro_default_ns),
            },
        };
        const actions = {
            onMouseEnter: () => {
                debouncedMouseEnterOrLeave(<ExtraPanelInformation displayData={extraPanelData} />);
            },
            onMouseLeave: () => {
                debouncedMouseEnterOrLeave(undefined);
            },
        };
        return <MeasurementPassCriteriaDisplay displayData={FptData} actions={actions} />;
    };

    const GapDisplay = () => {
        if (!gapData) return null;
        const gapDisplayData = {
            title: 'Gap',
            min: nsAsMicroseconds(gapData.min),
            avg: nsAsMicroseconds(gapData.avg),
            max: nsAsMicroseconds(gapData.max),
            unit: 'μs',
        };
        return <MeasurementMinAvgMaxDisplay displayData={gapDisplayData} />;
    };

    const InterPacketTimeDisplay = () => {
        if (!interPacketData) return null;
        const interPacketTimeDisplayData = {
            title: 'PIT excluding the GAP',
            min: nsAsMicroseconds(interPacketData.min),
            avg: nsAsMicroseconds(interPacketData.avg),
            max: nsAsMicroseconds(interPacketData.max),
            unit: 'ns',
        };
        return <MeasurementMinAvgMaxDisplay displayData={interPacketTimeDisplayData} />;
    };
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
                <CInstDisplay />
                <VrxDisplay />
                <FptDisplay />
                <GapDisplay />
                <InterPacketTimeDisplay />
            </div>
        </>
    );
}

export default Dashboard21Info;
