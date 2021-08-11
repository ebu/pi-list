import React from 'react';
import { InformationStreamsExpanded } from '../index';
import { Information } from 'types/information';

interface IComponentProps {
    informationStreamsList: Information[];
    title: string;
    onClick: () => void;
}

function MediaInformationExpanded({ informationStreamsList, title, onClick }: IComponentProps) {
    return (
        <InformationStreamsExpanded onClick={onClick} title={title} informationStreamsList={informationStreamsList} />
    );
}

export default MediaInformationExpanded;
