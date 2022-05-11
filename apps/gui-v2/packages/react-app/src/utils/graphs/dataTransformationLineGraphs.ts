import { IGraphicTimeMaxData, IGraphicTimeValueData } from 'components/index';

const isIGraphicTimeMaxData = (
    data: IGraphicTimeMaxData[] | IGraphicTimeValueData[]
): data is IGraphicTimeMaxData[] => {
    return (data as IGraphicTimeMaxData[])[0].max !== (undefined || null);
};

export const getFinalData = (data: IGraphicTimeMaxData[] | IGraphicTimeValueData[]) => {
    if (isIGraphicTimeMaxData(data)) {
        const result: IGraphicTimeMaxData[] = data.reduce((acc, curr) => {
            if ((curr.time !== undefined || null) && (curr.max !== null || undefined)) {
                acc.push(curr);
            }
            return acc;
        }, [] as IGraphicTimeMaxData[]);
        return result;
    } else {
        const result: IGraphicTimeValueData[] = data.reduce((acc, curr) => {
            if ((curr.time !== undefined || null) && (curr.value !== null || undefined)) {
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
