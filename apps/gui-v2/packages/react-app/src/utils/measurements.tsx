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
