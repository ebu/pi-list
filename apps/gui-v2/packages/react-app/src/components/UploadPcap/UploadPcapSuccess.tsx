import React from 'react';
import { AnalysisIcon } from '../icons/index';
import './styles.scss';

function UploadPcapSuccess({ onResetState }: { onResetState: () => void }) {
    const onClick = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        onResetState();
    };

    setTimeout(onResetState, 5000);

    return (
        <div className="upload-success-container">
            <AnalysisIcon />
            <span>Upload successful!</span>
            <a onClick={onClick}>Dismiss</a>
        </div>
    );
}

export default UploadPcapSuccess;
