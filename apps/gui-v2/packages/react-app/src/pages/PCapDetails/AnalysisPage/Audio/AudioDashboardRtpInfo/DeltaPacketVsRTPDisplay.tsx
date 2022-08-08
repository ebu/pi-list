import SDK from '@bisect/ebu-list-sdk';
import { MeasurementPassCriteriaDisplay, ExtraPanelInformation } from 'components';
import { IMeasurementData } from 'utils/measurements';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const rangeToString = (value: SDK.api.pcap.IAudioValueRangeUs): string | undefined => {
    const min = value[0] ?? undefined;
    const max = value[1] ?? undefined;

    if (min === undefined && max === undefined) {
        return undefined;
    }

    if (min === undefined) {
        return `<= ${max}`;
    }

    if (max === undefined) {
        return `>= ${min}`;
    }

    return `[${min} .. ${max}]`;
};

type LabelValue = {
    label: string;
    value: string;
};

const rangeToContentItem = (label: string, value: SDK.api.pcap.IAudioValueRangeUs): LabelValue | undefined => {
    const v = rangeToString(value);
    if (!v) return undefined;
    return {
        label,
        value: v,
    };
};

type RangeContentEntry = {
    label: string;
    value: SDK.api.pcap.IAudioValueRangeUs;
};

const rangeToContentArray = (entries: RangeContentEntry[]): LabelValue[] => {
    const x = entries.map(item => rangeToContentItem(item.label, item.value));
    const y = x.filter(v => v !== undefined) as LabelValue[];
    return y;
};

const DeltaPacketVsRTPDisplay = ({
    deltaPktTsVsRtpTs,
    setAdditionalInformation,
}: {
    deltaPktTsVsRtpTs: SDK.api.pcap.IStreamAnalysis;
    setAdditionalInformation: SetSidebarInfoType;
}) => {
    if (!deltaPktTsVsRtpTs) return null;

    const measurementData: IMeasurementData = {
        title: labels.audioLatencyTitle,
        data: [
            {
                label: 'Min',
                value: deltaPktTsVsRtpTs.details.range.min.toFixed(1),
            },
            {
                label: 'Avg',
                value: deltaPktTsVsRtpTs.details.range.avg.toFixed(1),
            },
            {
                label: 'Max',
                value: deltaPktTsVsRtpTs.details.range.max.toFixed(1),
            },
        ],
        unit: 'μs',
    };

    const details = deltaPktTsVsRtpTs.details as SDK.api.pcap.IAudioLatencyAnalysisDetails;
    const extraPanelData = {
        title: 'Range',
        units: 'μs',
        content: rangeToContentArray([
            { label: 'Min', value: details.limit.min },
            { label: 'Avg', value: details.limit.avg },
            { label: 'Max', value: details.limit.max },
        ]),
    };

    const additionalInformation = (
        <div>
            <div className="extra-panel-information-container">
                <span className="extra-panel-information-header">{labels.audioLatencyTitle}</span>
                <span className="extra-panel-information-title">Definition</span>
                <span className="extra-panel-information-value">{labels.audioLatencyDefinition}</span>
            </div>
            <ExtraPanelInformation displayData={extraPanelData} />
        </div>
    );

    const actions = {
        onMouseEnter: () => {
            setAdditionalInformation(additionalInformation);
        },
        onMouseLeave: () => {
            setAdditionalInformation(undefined);
        },
    };

    return <MeasurementPassCriteriaDisplay displayData={measurementData} actions={actions} />;
};

export default DeltaPacketVsRTPDisplay;
