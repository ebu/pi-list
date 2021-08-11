import React from 'react';

interface ComponentProps {
    props: ITitle;
}

function Title({ props }: ComponentProps) {
    return (
        <div className="dashboard-title">
            {props.titleNumber ? <div className="dashboard-title-number">{props.titleNumber}</div> : null}
            <div className="dashboard-main-title">{props.mainTitle}</div>
        </div>
    );
}

export interface ITitle {
    titleNumber?: string;
    mainTitle: string;
}

export default Title;
