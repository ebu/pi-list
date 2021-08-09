import React from 'react';
import { InformationStreamsExpanded } from '../index';
type information = {
    title: string;
    value: string;
    attention?: boolean;
};

interface IComponentProps {
    informationStreamsList: information[];
    title: string;
    onClick: () => void;
}

function NetworkInformationExpanded({ informationStreamsList, title, onClick }: IComponentProps) {
    return (
        <InformationStreamsExpanded onClick={onClick} title={title} informationStreamsList={informationStreamsList} />
    );
}

export default NetworkInformationExpanded;
