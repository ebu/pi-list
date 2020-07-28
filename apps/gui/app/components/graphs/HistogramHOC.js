import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { translateX } from 'utils/translation';
import Histogram from './Histogram';

const fetchData = async asyncGetter => {
    try {
        const result = await asyncGetter();

        if (!Array.isArray(result)) {
            const message = `Result is not an array: ${JSON.stringify(result)}`;
            console.error(message);
            return { error: message };
        }

        const v = result.reduce((acc, curr) => {
            const [value, count] = curr;
            acc[value] = count;
            return acc;
        }, {});

        const x = Object.keys(v);
        const y = x.map(key => v[key]);

        return { x, y };
    } catch (err) {
        return { error: err.toString() };
    }
};

const HistogramHOC = ({ asyncGetter, title, titleTag, titleParam, xTitle, xTitleTag, yTitle, yTitleTag }) => {
    const [state, setState] = useState({ isLoading: true });

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

    return <Histogram title={actualTitle} x={state.x} y={state.y} xTitle={xt} yTitle={yt} />;
};

HistogramHOC.propTypes = {
    asyncGetter: PropTypes.func.isRequired,
    title: PropTypes.string,
    titleTag: PropTypes.string,
    titleParam: PropTypes.string,
    xTitle: PropTypes.string,
    xTitleTag: PropTypes.string,
    yTitle: PropTypes.string,
    yTitleTag: PropTypes.string,
};

HistogramHOC.defaultProps = {
    title: undefined,
    titleTag: undefined,
    titleParam: undefined,
    xTitle: undefined,
    xTitleTag: undefined,
    yTitle: undefined,
    yTitleTag: undefined,
};

export default HistogramHOC;
