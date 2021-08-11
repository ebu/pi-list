import React from 'react';
import NetworkInformationExpanded from './NetworkInformationExpanded';
import NetworkInformationCollapsed from './NetworkInformationCollapsed';

type information = {
    title: string;
    value: string;
    attention?: boolean;
};

interface IComponentProps {
    informationStreamsList: information[];
    title: string;
}
function index({ informationStreamsList, title }: IComponentProps) {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const onClick = () => setIsExpanded(!isExpanded);

    return isExpanded ? (
        <NetworkInformationExpanded onClick={onClick} title={title} informationStreamsList={informationStreamsList} />
    ) : (
        <NetworkInformationCollapsed onClick={onClick} title={title} />
    );
}

export default index;
