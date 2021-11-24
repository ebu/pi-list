import { IScatterGraphicElement } from 'components/index';

export const getScatterBucketData = (data: number[][]) => {
    const result = data.reduce((acc, curr) => {
        const index = curr[0];
        const value = curr[1];
        acc.push({ label: index, value: value });
        return acc;
    }, [] as IScatterGraphicElement[]);

    return result;
};

export const getFinalScatterBucketData = (data: IScatterGraphicElement[]) => {
    const bucketArray: any = [];
    data.map(item => {
        bucketArray.push([
            { label: item.label, value: item.value },
            { label: item.label, value: 0 },
        ]);
    });

    return bucketArray;
};

export const getCompliance = (value: string | undefined) => {
    if (value === 'narrow') {
        return { text: 'N (Narrow)', compliant: true };
    } else if (value === 'narrow_linear') {
        return { text: 'NL (Narrow Linear)', compliant: true };
    } else if (value === 'wide') {
        return { text: 'W (Wide)', compliant: true };
    } else if (value === 'compliant') {
        return { text: 'Compliant', compliant: true };
    } else {
        return { text: 'Not Compliant', compliant: false };
    }
};
