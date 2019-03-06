import React from 'react';

const SingleValueEntry = ({ label, value }) => (
    <div class="lst-stream-info2-value-group">
        <span class="lst-stream-info2-measurement">{label}</span>
        <div class="lst-stream-info2-value">{value}</div>
    </div>
);

// values: [{ label: DOMNode, value: DOMNode }]
const MultiValueDisplay = ({ label, units, values }) => {
    const renderedValues = values.map(value => <SingleValueEntry {...value} />);

    return (
        <div class="lst-stream-info2-base">
            <div class="lst-stream-info2-label-group">
                <span class="lst-stream-info2-label">{label}</span>
            </div>
            {renderedValues}
            <span class="lst-stream-info2-units">{units}</span>
        </div>
    );
};

export default MultiValueDisplay;
