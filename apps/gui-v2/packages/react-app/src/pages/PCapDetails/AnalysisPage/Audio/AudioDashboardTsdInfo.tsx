import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { translate } from '../../../../utils/translation';
import { informationSidebarContentAtom } from '../../../../store/gui/informationSidebar/informationSidebarContent';
import { useSetRecoilState } from 'recoil';
import { ExtraPanelInformation, MeasurementPassCriteriaDisplay } from '../../../../components';
import { debounce } from 'lodash';

function AudioDashboardRtpInfo({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const analysis = currentStream?.global_audio_analysis.tsdf;
    const tsdf_max = analysis.max === null || analysis.max === undefined ? '---' : analysis.max;
    const invalid = analysis.result !== 'compliant';
    const setInformationSidebarContent = useSetRecoilState(informationSidebarContentAtom);

    const summary = [
        {
            labelTag: 'stream.compliance',
            value: analysis.result,
            attention: invalid,
        },
    ];

    const handleOnMouseEnterOrLeave = (extraPanelInformation: undefined | React.ReactElement) => {
        setInformationSidebarContent(extraPanelInformation);
    };

    const debouncedMouseEnterOrLeave = debounce(handleOnMouseEnterOrLeave, 300);

    const MaximumTimestampedDelayFactorDisplay = () => {
        const maximumTimestampedDelayFactorData = {
            measurementData: {
                title: translate('media_information.audio.tsdf_max'),
                data: [
                    {
                        value: tsdf_max,
                    },
                ],
            },
            unit: 'μs',
        };

        const extraPanelData = {
            title: 'Maximum',
            units: 'μs',
            content: {
                value: analysis.limit,
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

        return <MeasurementPassCriteriaDisplay displayData={maximumTimestampedDelayFactorData} actions={actions} />;
    };
    return (
        <>
            <div className="audio-dashboard-summary-container">
                <div className="audio-dashboard-title">
                    <span>TS-DF</span>
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
                <MaximumTimestampedDelayFactorDisplay />
            </div>
        </>
    );
}

export default AudioDashboardRtpInfo;
