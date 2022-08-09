import React from 'react';
import { LabelValue } from 'utils/measurements';
import './styles.scss';

const Item = ({ units, item }: { units: string; item: LabelValue }) => (
    <div className="extra-panel-information-label-value-container">
        <span className="extra-panel-information-label">{item.label}</span>
        <span className="extra-panel-information-value">
            {item.value} {units}
        </span>
    </div>
);

interface IComponentProps {
    title: string;
    units: string;
    content: Array<LabelValue> | LabelValue;
}

function ExtraPanelInformation({ displayData }: { displayData: IComponentProps }) {
    if (!displayData) return null;

    return (
        <div className="extra-panel-information-container">
            <span className="extra-panel-information-title">{displayData.title}</span>
            {displayData.content instanceof Array ? (
                displayData.content.map((item, index) => <Item key={index} item={item} units={displayData.units} />)
            ) : (
                <Item item={displayData.content} units={displayData.units} />
            )}
        </div>
    );
}
export default ExtraPanelInformation;
