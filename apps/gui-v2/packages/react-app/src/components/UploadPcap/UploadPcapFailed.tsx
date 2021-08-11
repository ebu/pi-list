import React from 'react';
import { AnalysisIcon } from '../icons/index';
import './styles.scss';

function UploadPcapFailed({ onResetState }: { onResetState: () => any }) {
    const onClick = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        onResetState();
    };

    setTimeout(onResetState, 5000);

    return (
        <div className="upload-failed-container">
            <AnalysisIcon />
            <span>Upload failed!</span>
            <a onClick={onClick}>Dismiss</a>
        </div>
    );
}

export default UploadPcapFailed;
