import analysisConstants from '../enums/analysis';

export const getComplianceSummary = v => {
    var res = true;
    for (var i = 0; i < v.length; i++) {
        res = v[i].result !== analysisConstants.outcome.compliant ? false : res;
    }
    return res
        ? { value: 'Compliant' }
        : { value: 'Not compliant', attention: true };
};

export const nsPropAsMinMaxAvgUs = info => {
    if (_.isNil(info)) return { min: '---', max: '---', avg: '---' };
    const toUs = v => (_.isNil(v) ? '---' : (v / 1000).toFixed(0));
    return { min: toUs(info.min), max: toUs(info.max), avg: toUs(info.avg) };
};

export const propAsMinMaxAvg = (info, nDecimal) => {
    if (_.isNil(info)) return { min: '---', max: '---', avg: '---' };
    return { min: info.min, max: info.max, avg: info.avg.toFixed(nDecimal || 0) };
};

export const getAverageFromHistogram = hist => {
    if (!hist || hist.length === 0) return 0;

    const avg = hist.reduce((prev, curr) => {
        return prev + (curr[0] * curr[1]) / 100;
    }, 0);

    return avg;
};

export const getLowestFromHistogram = hist => {
    if (!hist || hist.length === 0) return 0;
    return hist[0][0];
};

export const getHighestFromHistogram = hist => {
    if (!hist || hist.length === 0) return 0;
    return hist[hist.length - 1][0];
};
