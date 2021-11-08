import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './styles.scss';

interface IComponentProps {
    filename: string;
    percentage: number;
    numberFiles: number;
    uploadedFiles: number;
}

function CircularProgressBar({ filename, percentage, numberFiles, uploadedFiles }: IComponentProps) {
    let uploading;
    if (numberFiles === 1) {
        uploading = filename;
    } else {
        uploading = uploadedFiles.toString() + '/' + numberFiles.toString();
    }

    const p = percentage || 0;

    const percentageString = p.toFixed(0);

    return (
        <div className="upload-progress-container">
            <CircularProgressbar value={percentage} text={`${percentageString}%`} />
            <span className="upload-progress-filename">Uploading {uploading}</span>
        </div>
    );
}

export default CircularProgressBar;
