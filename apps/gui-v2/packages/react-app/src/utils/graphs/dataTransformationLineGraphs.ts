import { IGraphicTimeMaxData, IGraphicTimeValueData } from 'components/index';
import _ from 'lodash';

export function isIGraphicTimeMaxData(
    data: IGraphicTimeMaxData[] | IGraphicTimeValueData[] | Array<IGraphicTimeMaxData | IGraphicTimeValueData>
): data is IGraphicTimeMaxData[] {
    if (!Array.isArray(data) || data.length === 0) return false as any;
    const first = (data as Array<IGraphicTimeMaxData | IGraphicTimeValueData>).find((d) => d != null);
    if (!first) return false as any;
    return (first as IGraphicTimeMaxData).max != null;
}

export const getFinalData = (data: IGraphicTimeMaxData[] | IGraphicTimeValueData[]) => {
    const arr: Array<IGraphicTimeMaxData | IGraphicTimeValueData> = Array.isArray(data)
        ? data
        : ((data as any)?.data && Array.isArray((data as any).data) ? (data as any).data : []);

    if (arr.length === 0) return [];

    if (isIGraphicTimeMaxData(arr)) {
        const result: IGraphicTimeMaxData[] = (arr as IGraphicTimeMaxData[]).reduce((acc, curr) => {
            if (!_.isNil((curr as IGraphicTimeMaxData).time) && !_.isNil((curr as IGraphicTimeMaxData).max)) {
                acc.push(curr);
            }
            return acc;
        }, [] as IGraphicTimeMaxData[]);
        return result;
    } else {
        const result: IGraphicTimeValueData[] = (arr as IGraphicTimeValueData[]).reduce((acc, curr) => {
            if (!_.isNil((curr as IGraphicTimeValueData).time) && !_.isNil((curr as IGraphicTimeValueData).value)) {
                acc.push(curr);
            }
            return acc;
        }, [] as IGraphicTimeValueData[]);

        return result;
    }
};

export const dataAsMicroseconds = (data: IGraphicTimeValueData[]) => {
    const values = data.map(item => Object.assign(item, { value: parseFloat((item.value * 1e6).toFixed(3)) }));
    return values;
};

export const getDeltaFPTvsRTP = (data: IGraphicTimeValueData[]) => {
    return data.map(v => {
        return { ...v, value: parseFloat((v.value / 1000).toFixed(3)) };
    });
};

const measureText = (text: string) => {
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.font = '12px "Helvetica Neue"';

    return ctx.measureText(text).width;
};

export const getLeftMargin = (data: IGraphicTimeMaxData[] | IGraphicTimeValueData[]) => {
    let leftMargin = 0;
    if (isIGraphicTimeMaxData(data)) {
        data.forEach(item => {
            const textWidth = measureText(item.max?.toString());
            if (textWidth > leftMargin) {
                leftMargin = textWidth;
            }
        });
    } else {
        data.forEach(item => {
            const textWidth = measureText(item?.value?.toString());
            if (textWidth > leftMargin) {
                leftMargin = textWidth;
            }
        });
    }
    leftMargin = Math.max(0, leftMargin - 50);
    if (leftMargin !== 0) {
        return leftMargin + 15;
    } else {
        return leftMargin;
    }
};
