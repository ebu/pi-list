import React from 'react';
import './styles.scss';

interface IComponentProps {
    text: string
}

function SimpleTooltip({ text }: IComponentProps) {
    return (
        <div>
            <div className="simple-tooltip">
                <span className="simple-tooltip-text">{text}</span>
            </div>
        </div>
    )
}

export default SimpleTooltip
