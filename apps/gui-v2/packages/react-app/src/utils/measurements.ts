import SDK from '@bisect/ebu-list-sdk';

export type LabelValue = {
    label: string | React.ReactElement;
    value: string;
    attention?: boolean;
};

export interface IMeasurementData {
    title: string | React.ReactElement;
    data: Array<LabelValue>;
    unit: string;
}

const rangeToString = (value: SDK.api.pcap.IAudioValueRangeUs): string | undefined => {
    const min = value.min ?? undefined;
    const max = value.max ?? undefined;

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

export const rangeToContentArray = (entries: RangeContentEntry[]): LabelValue[] => {
    const x = entries.map(item => rangeToContentItem(item.label, item.value));
    const y = x.filter(v => v !== undefined) as LabelValue[];
    return y;
};
