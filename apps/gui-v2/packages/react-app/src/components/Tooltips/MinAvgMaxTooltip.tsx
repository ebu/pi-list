import React from 'react';
import './styles.scss';

interface IComponentProps {
    valueTime: string;
    valueMin: string;
    valueAvg: string;
    valueMax: string;
}

function MinAvgMaxTooltip({ valueTime, valueMin, valueAvg, valueMax }: IComponentProps) {
    return (
        <div>
            <div className="min-max-avg-tooltip">
                <div className="time-tooltip">
                    <span className="time-tooltip-label">Timeline</span>
                    <span className="time-tooltip-value"> {valueTime}</span>
                </div>
                <div className="min-tooltip">
                    <span className="value-tooltip-label">Min</span>
                    <span className="value-tooltip-value"> {valueMin}</span>
                </div>
                <div className="avg-tooltip">
                    <span className="value-tooltip-label">Avg</span>
                    <span className="value-tooltip-value">{parseFloat(valueAvg).toFixed(3)}</span>
                </div>
                <div className="max-tooltip">
                    <span className="value-tooltip-label">Max</span>
                    <span className="value-tooltip-value">{valueMax}</span>
                </div>
            </div>
        </div>
    );
}

export default MinAvgMaxTooltip;
