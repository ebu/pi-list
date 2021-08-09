import React from 'react';
import Title, { ITitle } from './Title';
import Content, { IContent } from './Content';
import Information, { IInformation } from './Information';
import './styles.scss';

interface ComponentProps {
    id: string;
    information?: Array<IInformation>;
    title: ITitle;
    content: IContent;
    selectedPcapIds?: string[];
}

function DashboardTile({ id, information, title, content, selectedPcapIds }: ComponentProps) {
    const isActive = selectedPcapIds?.includes(id);

    return (
        <div className={`dashboard-tile ${isActive ? 'active-tile' : ''}`}>
            <div className={`dashboard-blend-div ${isActive ? 'active-tile' : ''}`}></div>
            <div>
                {/* Header */}
                <Title props={title} />
                {/* Middle Content */}
                <Content props={content} />
                {/*Information */}
                {information ? <Information props={information} /> : <div className="dashboard-not-information"></div>}
            </div>
        </div>
    );
}

export default DashboardTile;
