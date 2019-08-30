import React from 'react';
import { translateX } from 'utils/translation';

const SingleValueEntry = ({ label, value }) => (
    <div className="lst-stream-info2-value-group">
        <span className="lst-stream-info2-measurement">{label}</span>
        <div className="lst-stream-info2-value">{value}</div>
    </div>
);

// values: [{ label: DOMNode, value: DOMNode }]
const MultiValueDisplay = ({ label, labelTag, units, values, message }) => {
    const renderedValues = values.map((value, index) => (
        <SingleValueEntry key={index} {...value} />
    ));
    label = label || translateX(labelTag);

    return (
        <div className="lst-stream-info2-base">
            <div className="col-xs-4 lst-stream-info2-label-group">
                <span className="lst-stream-info2-label">{label}</span>
            </div>
            <div className="col-xs-8 lst-stream-info2-base">
                {renderedValues}
                <span className="lst-stream-info2-units">{units}</span>
                <span className="lst-stream-info2-message">{message}</span>
            </div>
        </div>
    );
};

export default MultiValueDisplay;
