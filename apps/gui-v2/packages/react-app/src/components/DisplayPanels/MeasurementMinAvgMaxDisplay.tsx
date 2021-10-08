import React from 'react';
import './styles.scss';

interface IComponentProps {
    title: string;
    min: string;
    avg: string;
    max: string;
    unit: string;
    attention?: boolean;
}

function MeasurementMinAvgMaxDisplay({ displayData }: { displayData: IComponentProps }) {
    return (
        <div className="display-panel-container">
            <div className="blend-div"></div>
            <span className="display-panel-title">{displayData.title}</span>
            <div className="display-panel-title-underline"></div>
            <div className="display-panel-information">
                <div className="display-panel-information-item">
                    <div className="display-panel-information-data">
                        <span>{displayData.min}</span>
                    </div>
                    <div className="display-panel-information-bar"></div>
                    <div className="display-panel-label">
                        <span>Min</span>
                    </div>
                </div>

                <div className="display-panel-information-item">
                    <div className="display-panel-information-data">
                        <span>{displayData.avg}</span>
                    </div>
                    <div className="display-panel-information-bar"></div>
                    <div className="display-panel-label">
                        <span>Avg</span>
                    </div>
                </div>

                <div className="display-panel-information-item">
                    <div className="display-panel-information-data">
                        <span>{displayData.max}</span>
                    </div>
                    <div className="display-panel-information-bar"></div>
                    <div className="display-panel-label">
                        <span>Max</span>
                    </div>
                </div>
                <span className="display-panel-information-units">{displayData.unit}</span>
            </div>
        </div>
    );
}

export default MeasurementMinAvgMaxDisplay;
