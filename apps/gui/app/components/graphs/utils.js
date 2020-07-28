import _ from 'lodash';

export const histogramAsPercentages = v => {
    const histogram = _.get(v, 'histogram', null);
    if (histogram === null) return null;
    const total = histogram.reduce((acc, current) => acc + current[1], 0);
    const percentages = histogram.map(v => [v[0], (v[1] / total) * 100]);
    return percentages;
};
