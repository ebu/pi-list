import React from 'react';
import './styles.scss';
type subStreamInfo = {
    label: string;
    value: string | undefined;
    attention?: boolean;
};

interface IComponentProps {
    displayData: Array<subStreamInfo>;
}

function SubStreamsExplorerDisplay({ displayData }: IComponentProps) {
    return (
        <div className="sub-streams-explorer-display-panel-container">
            <div className="blend-div"></div>
            <span className="display-panel-title">Ancillary Data</span>
            <span className="display-panel-title-underline"></span>
            <div className="sub-streams-explorer-display-panel-information">
                {displayData.map((item, index) => (
                    <div className="sub-streams-explorer-display-panel-information-data" key={index}>
                        <div className="sub-streams-explores-label">{item.label} </div>
                        <div className={`sub-streams-explores-value ${item.attention === true ? 'attention' : ''}`}>
                            {item.value}{' '}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SubStreamsExplorerDisplay;
