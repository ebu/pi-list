import React from 'react';
import './styles.scss';

interface IComponentProps {
    title: string;
    units: string;
    content: Array<{ label?: string; value: string }> | { label?: string; value: string };
}

function ExtraPanelInformation({ displayData }: { displayData: IComponentProps }) {
    if (!displayData) return null;

    return (
        <div className="extra-panel-information-container">
            <span className="extra-panel-information-title">{displayData.title}</span>
            {displayData.content instanceof Array ? (
                displayData.content.map((item, index) => (
                    <div className="extra-panel-information-label-value-container" key={index}>
                        <span className="extra-panel-information-label">{item.label}</span>
                        <span className="extra-panel-information-value">
                            {item.value} {displayData.units}
                        </span>
                    </div>
                ))
            ) : (
                <div className="extra-panel-information-label-value-container">
                    <span className="extra-panel-information-label">{displayData.content.label}</span>
                    <span className="extra-panel-information-value">
                        {displayData.content.value} {displayData.units}
                    </span>
                </div>
            )}
        </div>
    );
}
export default ExtraPanelInformation;
