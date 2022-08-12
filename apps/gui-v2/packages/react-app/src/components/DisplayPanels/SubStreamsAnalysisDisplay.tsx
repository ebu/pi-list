import React from 'react';

type subStreamType = {
    id: string;
    type: string | undefined;
};

interface IComponentProps {
    displayData: Array<subStreamType>;
}

function SubStreamsAnalysisDisplay({ displayData }: IComponentProps) {
    return (
        <div className="sub-streams-display-panel-container">
            <div className="blend-div"></div>
            <span className="display-panel-title">Ancillary sub stream</span>
            <div className="sub-streams-display-panel-information">
                {displayData.map((item, index) => (
                    <div className="sub-streams-display-panel-information-data" key={index}>
                        <span>ID: {item.id}</span>
                        <span>Type: {item.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SubStreamsAnalysisDisplay;
