import React from 'react';
import './styles.scss';

interface IComponentProps {
    valueY: string;
    valueYLabel: string;
    valueX: string;
    valueXLabel: string;
}

function TimeValueTooltip({ valueX, valueXLabel, valueY, valueYLabel }: IComponentProps) {
    return (
        <div>
            <div className="time-value-tooltip">
                <div className="time-tooltip">
                    <span className="time-tooltip-label">{valueXLabel}</span>
                    <span className="time-tooltip-value"> {valueX}</span>
                </div>
                <div className="value-tooltip">
                    <span className="value-tooltip-label">{valueYLabel}</span>
                    <span className="value-tooltip-value">{valueY}</span>
                </div>
            </div>
        </div>
    );
}

export default TimeValueTooltip;
