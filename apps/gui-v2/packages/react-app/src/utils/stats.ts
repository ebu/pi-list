import { api } from '@bisect/ebu-list-sdk';
export const getComplianceSummary = (v: any) => {
    var res = true;
    for (var i = 0; i < v.length; i++) {
        res = v[i].result !== api.constants.analysisConstants.outcome.compliant ? false : res;
    }
    return res
        ? { value: 'Compliant' }
        : { value: 'Not compliant', attention: true };
};

export const nsPropAsMinMaxAvgUs = (info: any) => {
    if (info === null) return { min: '---', max: '---', avg: '---' };
    const toUs = (v: any) => (v === null ? '---' : (v / 1000).toFixed(0));
    return { min: toUs(info.min), max: toUs(info.max), avg: toUs(info.avg) };
};

export const propAsMinMaxAvg = (info: any, nDecimal?: number) => {
    if (info === null) return { min: '---', max: '---', avg: '---' };
    return { min: info.min, max: info.max, avg: info.avg.toFixed(nDecimal || 0) };
};

export const getAverageFromHistogram = (hist: any) => {
    if (!hist || hist.length === 0) return 0;

    const avg = hist.reduce((prev: any, curr: any) => {
        return prev + (curr[0] * curr[1]) / 100;
    }, 0);

    return avg;
};

export const getLowestFromHistogram = (hist: any) => {
    if (!hist || hist.length === 0) return 0;
    return hist[0][0];
};

export const getHighestFromHistogram = (hist: any) => {
    if (!hist || hist.length === 0) return 0;
    return hist[hist.length - 1][0];
};

export const nsAsMicroseconds = (value: number) => (value / 1000).toFixed(3);
