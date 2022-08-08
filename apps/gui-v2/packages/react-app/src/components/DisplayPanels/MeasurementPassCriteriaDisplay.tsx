import React from 'react';
import { IMouseOverHandler } from 'utils/useSidebarInfo';
import { IMeasurementData } from 'utils/measurements';
import './styles.scss';

function MeasurementPassCriteriaDisplay({
    displayData,
    actions,
}: {
    displayData: IMeasurementData;
    actions?: IMouseOverHandler;
}) {
    return (
        <div
            className={`display-panel-container ${actions ? 'actions' : ''}`}
            onMouseEnter={actions?.onMouseEnter}
            onMouseLeave={actions?.onMouseLeave}
        >
            <div className="blend-div"></div>
            <span className="display-panel-title">{displayData.title} </span>
            <div className="display-panel-information">
                {displayData.data.map((item, index) => (
                    <div className="display-panel-information-item" key={index}>
                        <div
                            className={`display-panel-information-data ${item.attention === true ? 'attention' : ''}`}
                            key={index}
                        >
                            <span>{item.value}</span>
                        </div>
                        <div className="display-panel-information-bar"></div>
                        <div className="display-panel-label">
                            <span>{item.label}</span>
                        </div>
                    </div>
                ))}
                <span className="display-panel-information-units">{displayData.unit}</span>
            </div>
        </div>
    );
}

export default MeasurementPassCriteriaDisplay;
