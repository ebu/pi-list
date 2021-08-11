import React from 'react';
import { InformationStreamsCollapsed } from '../index';

function MediaInformationCollapsed({ onClick, title }: { onClick: () => void; title: string }) {
    return <InformationStreamsCollapsed onClick={onClick} title={title} />;
}

export default MediaInformationCollapsed;
