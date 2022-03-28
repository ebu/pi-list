import { AnalysisIcon } from '../icons/index';


function UploadSdpFailed({ onResetState }: { onResetState: () => void }) {
    const onClick = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        onResetState();
    };

    setTimeout(onResetState, 5000);

    return (
        <div className="">
            <AnalysisIcon />
            <span>Upload failed!</span>
            <a onClick={onClick}>Dismiss</a>
        </div>
    );
}

export default UploadSdpFailed;
