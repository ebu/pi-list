import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Dispatch } from 'react';
import { DropSdpHere, UploadSdpSuccess, UploadSdpFailed, DragAndDropSdpUpload } from 'components/index';
import './styles.scss';
import { v1 as uuid } from 'uuid';

const states = {
    normal: 'normal',
    uploading: 'uploading',
    uploadCompleted: 'uploadCompleted',
    uploadFailed: 'uploadFailed',
    actionRequestCompleted: 'actionRequestCompleted',
    actionRequestFailed: 'actionRequestFailed',
};

const uploadProgressKind = {
    completed: 'completed',
    failed: 'failed',
};

interface IComponentProps {
    patchPcap: (pcapId: string, sdps: any) => void;
    pcapId: string;
}

function UploadSdp({ patchPcap, pcapId }: IComponentProps) {
    const [state, setState] = React.useState(states.normal);
    const [sdps, setSdps] = React.useState<any[]>([]);

    const uploadProgress = (progressKind: string) => {
        switch (progressKind) {
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

    const setUploadedSdps = (sdps: any[]) => {
        setSdps(sdps);
        patchPcap(pcapId, sdps);
    };

    const getUploadStatus = (
        filesUploaded: string[],
        numberFiles: number,
        callback: (progressKind: string) => void
    ) => {
        const successfullUploadedFiles = filesUploaded.reduce((acc: number, curr: string) => {
            if (curr === 'completed') {
                acc++;
            }
            return acc;
        }, 0);
        successfullUploadedFiles === numberFiles
            ? callback(uploadProgressKind.completed)
            : callback(uploadProgressKind.failed);
    };

    React.useEffect(() => {
        patchPcap(pcapId, sdps);
    }, [sdps]);

    const onAcceptProgress = (receivedFiles: any, numberFiles: number, callback: (progressKind: string) => void) => {
        let completedFiles = 0;
        let uploadedFiles = 0;
        const filesUploaded: string[] = [];

        receivedFiles.map((fileToUpload: any) => {
            var reader = new FileReader();
            fileToUpload.id = uuid();
            reader.onload = function(event) {
                setSdps(current => [...current, { sdpParsed: event?.target?.result, sdpFile: fileToUpload }]);
            };
            reader.readAsText(fileToUpload);
            patchPcap(pcapId, sdps);
            uploadedFiles++;
            completedFiles++;
            filesUploaded.push('completed');
            if (completedFiles === numberFiles) getUploadStatus(filesUploaded, numberFiles, callback);
        });
    };

    const onDrop = React.useCallback((receivedFiles: any) => {
        onAcceptProgress(receivedFiles, Object.keys(receivedFiles).length, uploadProgress);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const resetState = () => {
        setState(states.normal);
    };

    const normalContents = <DragAndDropSdpUpload />;
    const activeContents = <DropSdpHere />;

    const uploadCompleted = <UploadSdpSuccess receivedSdps={sdps} setUploadedSdps={setUploadedSdps} pcapId={pcapId} />;
    const uploadFailed = <UploadSdpFailed onResetState={resetState} />;

    const getContents = React.useCallback(() => {
        switch (state) {
            case states.normal:
                return isDragActive ? [activeContents, 'is-active'] : [normalContents, ''];
            case states.uploadCompleted:
                return [uploadCompleted, 'is-primary'];
            case states.uploadFailed:
                return [uploadFailed, 'is-danger'];
            default:
                break;
        }
    }, [isDragActive, activeContents, normalContents, uploadFailed, state]);

    const contents: (JSX.Element | string)[] | undefined = getContents();
    if (contents === undefined) {
        return null;
    }

    return (
        <div className="upload-pcap-tile">
            {state === states.uploadCompleted ? (
                uploadCompleted
            ) : (
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className={`drag-and-drop-sdp-tile ${contents[1]}`}> {contents[0]}</div>
                </div>
            )}
        </div>
    );
}

export default UploadSdp;
