import React from 'react';
import './styles.scss';
import { ArrowCollapsedIcon } from '../icons/index';

function InformationStreamsCollapsed({ onClick, title }: { onClick: () => void; title: string }) {
    return (
        <div className="information-streams-content">
            <div className="information-streams-title-container-collapsed" onClick={onClick}>
                <span className="information-streams-title">{title}</span>
                <ArrowCollapsedIcon className="information-streams-arrow-icon" />
            </div>
        </div>
    );
}

export default InformationStreamsCollapsed;
