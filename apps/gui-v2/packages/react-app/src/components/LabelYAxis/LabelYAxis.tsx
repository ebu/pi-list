import React from 'react';
import './style.scss';
function LabelYAxis({ title }: { title: string }) {
    return (
        <div className="label-y-axis-container">
            <span className="label-y-axis">{title}</span>
        </div>
    );
}

export default LabelYAxis;
