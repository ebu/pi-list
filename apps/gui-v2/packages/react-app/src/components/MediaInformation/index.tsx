import React from 'react';
import MediaInformationExpanded from './MediaInformationExpanded';
import MediaInformationCollapsed from './MediaInformationCollapsed';
import { Information } from 'types/information';

interface IComponentProps {
    informationStreamsList: Information[];
    title: string;
}
function index({ informationStreamsList, title }: IComponentProps) {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const onClick = () => setIsExpanded(!isExpanded);

    return isExpanded ? (
        <MediaInformationExpanded onClick={onClick} title={title} informationStreamsList={informationStreamsList} />
    ) : (
        <MediaInformationCollapsed onClick={onClick} title={title} />
    );
}

export default index;
