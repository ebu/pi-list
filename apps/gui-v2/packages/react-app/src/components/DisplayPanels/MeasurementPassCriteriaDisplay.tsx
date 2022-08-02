import React from 'react';
import './styles.scss';

type labelValue = {
    labelTag?: string | React.ReactElement;
    value: string;
};

interface IMeasurementData {
    title: string | React.ReactElement;
    data: Array<labelValue>;
}

interface IPassCriteriaData {
    title: string | React.ReactElement;
    data: Array<labelValue>;
}

interface IComponentProps {
    measurementData: IMeasurementData;
    passCriteriaData?: IPassCriteriaData;
    unit: string;
    attention?: boolean;
}

export interface IMouseOverHandler {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

function MeasurementPassCriteriaDisplay({
    displayData,
    actions,
}: {
    displayData: IComponentProps;
    actions?: IMouseOverHandler;
}) {
    return (
        <div
            className={`display-panel-container ${actions ? 'actions' : ''}`}
            onMouseEnter={actions?.onMouseEnter}
            onMouseLeave={actions?.onMouseLeave}
        >
            <div className="blend-div"></div>
            <span className="display-panel-title">{displayData.measurementData.title} </span>
            <div className="display-panel-title-underline"></div>
            <div className="display-panel-information">
                {displayData.measurementData.data.map((item, index) => (
                    <div className="display-panel-information-item" key={index}>
                        <div
                            className={`display-panel-information-data ${
                                displayData.attention === true ? 'attention' : ''
                            }`}
                            key={index}
                        >
                            <span>{item.value}</span>
                        </div>
                        <div className="display-panel-information-bar"></div>
                        <div className="display-panel-label">
                            <span>{item.labelTag}</span>
                        </div>
                    </div>
                ))}
                <span className="display-panel-information-units">{displayData.unit}</span>
            </div>
            {displayData.passCriteriaData ? (
                <>
                    <span className="display-panel-title">{displayData.passCriteriaData.title}</span>
                    <span className="display-panel-title-underline"></span>
                    <div className="display-panel-information">
                        {displayData.passCriteriaData.data.map((item, index) => (
                            <div className="display-panel-information-item" key={index}>
                                <div className="display-panel-information-data">
                                    <span>{item.value}</span>
                                </div>
                                <div className="display-panel-information-bar"></div>
                                <div className="display-panel-label">
                                    <span>{item.labelTag}</span>
                                </div>
                            </div>
                        ))}
                        <span className="display-panel-information-units">{displayData.unit}</span>
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default MeasurementPassCriteriaDisplay;
