import React from 'react';
import { useDropzone } from 'react-dropzone';
import CircularProgressBar from '../CircularProgressBar/CircularProgressBar';
import DragAndDropTileUpload from '../DragAndDropTile/DragAndDropTileUpload';
import { DropHere, UploadPcapSuccess, UploadPcapFailed } from '../index';
import './styles.scss';

const states = {
    normal: 'normal',
    uploading: 'uploading',
    uploadCompleted: 'uploadCompleted',
    uploadFailed: 'uploadFailed',
    actionRequestCompleted: 'actionRequestCompleted',
    actionRequestFailed: 'actionRequestFailed',
};

const uploadProgressKind = {
    progress: 'progress',
    completed: 'completed',
    failed: 'failed',
};

function UploadPcap() {
    const [state, setState] = React.useState(states.normal);
    const [uploadPercentage, setUploadPercentage] = React.useState(0);
    const [filename, setFilename] = React.useState('');

    const uploadProgress = (progressKind: string, percentage?: number) => {
        switch (progressKind) {
            case uploadProgressKind.progress:
                if (percentage === undefined) {
                    break;
                }
                setState(states.uploading);
                setUploadPercentage(percentage);
                break;
            case uploadProgressKind.completed:
                setState(states.uploadCompleted);
                break;
            case uploadProgressKind.failed:
                setState(states.uploadFailed);
                break;
            default:
                break;
        }
    };

    const onAcceptProgress = (callback: (progressKind: string, percentage?: number) => void) => {
        const arrayN: Array<number> = [25, 50, 75, 100];
        arrayN.forEach((item, index) => {
            setTimeout(() => {
                callback(uploadProgressKind.progress, item);
                if (index === arrayN.length - 1) {
                    callback(uploadProgressKind.completed);
                }
            }, index * 1000);
        });
    };

    const onDrop = React.useCallback((acceptedFiles: any) => {
        setFilename(acceptedFiles[0].path);
        onAcceptProgress(uploadProgress);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const resetState = () => setState(states.normal);

    const normalContents = <DragAndDropTileUpload />;
    const activeContents = <DropHere />;
    const uploading = (
        <CircularProgressBar filename={filename} percentage={uploadPercentage} numberFiles={1} uploadedFiles={1} />
    );
    const uploadCompleted = <UploadPcapSuccess onResetState={resetState} />;
    const uploadFailed = <UploadPcapFailed onResetState={resetState} />;

    const getContents = React.useCallback(() => {
        switch (state) {
            case states.normal:
                return isDragActive ? [activeContents, 'is-active'] : [normalContents, ''];
            case states.uploading:
                return [uploading, ''];
            case states.uploadCompleted:
                return [uploadCompleted, 'is-primary'];
            case states.uploadFailed:
                return [uploadFailed, 'is-danger'];
            default:
                break;
        }
    }, [isDragActive, activeContents, normalContents, uploading, uploadCompleted, uploadFailed, state]);

    const contents: (JSX.Element | string)[] | undefined = getContents();
    if (contents === undefined) {
        return null;
    }

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div className={`drag-and-drop-tile ${contents[1]}`}> {contents[0]}</div>
        </div>
    );
}

export default UploadPcap;
