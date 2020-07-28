import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { translateX } from 'utils/translation';
import LineGraph from './LineGraph';

const fetchData = async asyncGetter => {
    try {
        const result = await asyncGetter();
        if (!Array.isArray(result)) {
            const message = `Result is not an array: ${JSON.stringify(result)}`;
            console.error(message);
            return { error: message };
        }

        const v = result.reduce(
            (acc, curr) => {
                if (typeof curr.time !== 'undefined') acc.x.push(curr.time);
                else if (typeof curr.index !== 'undefined') acc.x.push(curr.index);
                if (typeof curr.value !== 'undefined') acc.y.push(curr.value);
                if (typeof curr.min !== 'undefined') acc.min.push(curr.min);
                if (typeof curr.max !== 'undefined') acc.max.push(curr.max);
                if (typeof curr.mean !== 'undefined') acc.mean.push(curr.mean);
                if (typeof curr.stddev !== 'undefined') acc.stddev.push(curr.stddev);
                if (typeof curr['high-limit'] !== 'undefined') acc.highLimit.push(curr['high-limit']);
                if (typeof curr['high-tolerance'] !== 'undefined') acc.highTolerance.push(curr['high-tolerance']);
                return acc;
            },
            {
                x: [],
                y: [],
                min: [],
                max: [],
                mean: [],
                stddev: [],
                highLimit: [],
                highTolerance: [],
            }
        );

        return {
            x: v.x,
            y: v.y,
            min: v.min,
            max: v.max,
            mean: v.mean,
            stddev: v.stddev,
            highLimit: v.highLimit,
            highTolerance: v.highTolerance,
            isLoading: false,
        };
    } catch (err) {
        return { error: err.toString() };
    }
};

const LineGraphHoc = ({ asyncGetter, title, titleTag, titleParam, xTitle, xTitleTag, yTitle, yTitleTag, layoutProperties }) => {
    const [state, setState] = useState({
        key: '',
        x: [],
        y: [],
        value: [],
        min: [],
        max: [],
        mean: [],
        stddev: [],
        highLimit: [],
        highTolerance: [],
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const getData = async () => fetchData(asyncGetter);
        getData().then(d => setState(d));
    }, []);

    const tTitle = title || translateX(titleTag);
    const actualTitle = _.isNil(titleParam) ? tTitle : `${tTitle} (${titleParam})`;
    const xt = xTitle || translateX(xTitleTag);
    const yt = yTitle || translateX(yTitleTag);

    if (state.error) {
        return <div>{state.error}</div>;
    }

    if (state.isLoading) {
        return <div>Loading</div>;
    }

    return (
        <LineGraph
            title={actualTitle}
            x={state.x}
            y={state.y}
            value={state.value}
            min={state.min}
            max={state.max}
            mean={state.mean}
            stddev={state.stddev}
            highLimit={state.highLimit}
            highTolerance={state.highTolerance}
            xTitle={xt}
            yTitle={yt}
            layoutProperties={layoutProperties}
        />
    );
};

LineGraphHoc.propTypes = {
    asyncGetter: PropTypes.func.isRequired,
    title: PropTypes.string,
    titleTag: PropTypes.string,
    titleParam: PropTypes.string,
    xTitle: PropTypes.string,
    xTitleTag: PropTypes.string,
    yTitle: PropTypes.string,
    yTitleTag: PropTypes.string,
    layoutProperties: PropTypes.object,
};

LineGraphHoc.defaultProps = {
    title: undefined,
    titleTag: undefined,
    titleParam: undefined,
    xTitle: undefined,
    xTitleTag: undefined,
    yTitle: undefined,
    yTitleTag: undefined,
    layoutProperties: {}
};

export default LineGraphHoc;
