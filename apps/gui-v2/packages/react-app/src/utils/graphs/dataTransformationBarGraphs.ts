import { IBarGraphic } from 'components/index';

interface IHistogramItem {
    [index: number]: number;
}

export interface IHistogram {
    histogram: Array<IHistogramItem>;
}

export const getFinalHistData = (dataPercentage: number[][]) => {
    const result = dataPercentage.reduce((acc, curr) => {
        const index = curr[0];
        const value = curr[1];
        acc.push({ label: index, value: parseFloat(value.toFixed(3)) });
        return acc;
    }, [] as IBarGraphic[]);

    return result;
};

export const getPercHistData = (data: IHistogram) => {
    const total = data.histogram.reduce((acc, curr) => acc + curr[1], 0);
    const percentages = data.histogram.map(v => [v[0], (v[1] / total) * 100]);
    return percentages;
};

const measureText = (text: string) => {
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.font = '12px "Helvetica Neue"';

    return ctx.measureText(text).width;
};

export const getLeftMarginBarGraphic = (data: IBarGraphic[]) => {
    let leftMargin = 0;
    data.forEach(item => {
        const textWidth = measureText(item.value.toString());
        if (textWidth > leftMargin) {
            leftMargin = textWidth;
        }
    });

    leftMargin = Math.max(0, leftMargin - 50);
    if (leftMargin !== 0) {
        return leftMargin + 15;
    } else {
        return leftMargin;
    }
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
