import React from 'react';
import { translate } from 'utils/translation';

const SingleValueEntry = ({ label, value }) => (
    <div className="lst-stream-info2-value-group">
        <span className="lst-stream-info2-measurement">{label}</span>
        <div className="lst-stream-info2-value">{value}</div>
    </div>
);

// values: [{ label: DOMNode, value: DOMNode }]
const MultiValueDisplay = ({ label, labelTag, units, values }) => {
    const renderedValues = values.map((value, index) => <SingleValueEntry key={index} {...value} />);
    label = label || translate(labelTag);

    return (
        <div className="lst-stream-info2-base">
            <div className="lst-stream-info2-label-group">
                <span className="lst-stream-info2-label">{label}</span>
            </div>
            {renderedValues}
            <span className="lst-stream-info2-units">{units}</span>
        </div>
    );
};

export default MultiValueDisplay;
