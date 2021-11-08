import React from 'react';
import './styles.scss';
import { ArrowExpandedIcon } from '../icons/index';
import { Information } from 'types/information';
import { translate, T } from 'utils/translation';

interface IComponentProps {
    informationStreamsList: Information[];
    title: string;
    onClick: () => void;
}

function InformationStreamExpanded({ item }: { item: Information }) {
    const itemTitle = item.titleTag ? <T t={item.titleTag} /> : item.title;
    const itemValue = item.valueTag ? <T t={item.valueTag} /> : item.value;

    if (itemValue === null || itemValue === undefined) {
        return null;
    }

    return (
        <div>
            <span className="information-streams-description-title">{itemTitle}</span>
            <span className={`information-streams-description-value ${item.attention === true ? 'attention' : ''}`}>
                {itemValue} {item.units}
            </span>
        </div>
    );
}

function InformationStreamsExpanded({ informationStreamsList, title, onClick }: IComponentProps) {
    return (
        <div className="information-streams-content">
            <div className="information-streams-title-container-expanded" onClick={onClick}>
                <span className="information-streams-title">{title}</span>
                <ArrowExpandedIcon className="information-streams-arrow-icon" />
            </div>
            {informationStreamsList.map((item, index) => (
                <InformationStreamExpanded key={index} item={item} />
            ))}
        </div>
    );
}

export default InformationStreamsExpanded;
