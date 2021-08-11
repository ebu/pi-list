import React from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ComponentProps {
    props: IContent
}

function Content({ props }: ComponentProps) {

    let pathColorControl = () => {
        switch (props.label) {
            case 'Compliant': return "#50E29C"; break;
            case 'Not Compliant': return "#D90000"; break;
            case 'Analysing': return "yellow"; break;
            case 'Failed': return "#c22727"; break;
        }
    }

    return (
        <div className="laab-upload-progress">
            <CircularProgressbar
                value={props.percentage}
                circleRatio={0.75}
                strokeWidth={4}
                styles={buildStyles({
                    rotation: 1 / 2 + 1 / 8,
                    strokeLinecap: "butt",
                    pathColor: pathColorControl(),
                    textColor: 'white',
                    pathTransitionDuration: 0.5,
                    trailColor: "rgba(255, 255, 255, 0.15)"
                })}
            />
            <div className="overlay"><div>{props.label}</div></div>
        </div>
    )
}

export interface IContent {
    label: string,
    percentage: number
};

export default Content
