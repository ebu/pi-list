import React from 'react';
import { useDropzone } from 'react-dropzone';
import {
    DropHere,
    UploadPcapSucess,
    UploadPcapFailed,
    CircularProgressBar,
    DragAndDropTileUpload,
} from 'components/index';
import UploadModal from './UploadModal';
import './styles.scss';
import list from '../../../utils/api';
import { CustomScrollbar } from 'components'



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

function UploadPcap({ isButton }: { isButton: boolean }) {
    const [state, setState] = React.useState(states.normal);
    const [isModalOpen, setModalOpen] = React.useState<boolean>(false);
    const [uploadPercentage, setUploadPercentage] = React.useState(0);
    const [filename, setFilename] = React.useState<string>('');
    const [numberFiles, setNumberFiles] = React.useState<number>(0);
    const [uploadedFiles, setUploadedFiles] = React.useState<number>(0);
    const [receivedFiles, setReceivedFiles] = React.useState<any[]>([]);

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

    const getAllFilesPercentage = (percentage: number, numberFiles: number, uploadedFiles: number): number => {
        if (numberFiles === 1) {
            return percentage;
        }
        const percentagePerFile = 100 / numberFiles;
        const percentageUploadedFiles = percentagePerFile * uploadedFiles;
        const percentageFile = ((100 / numberFiles) * percentage) / 100;
        if (percentageFile === percentagePerFile) setUploadedFiles(uploadedFiles + 1);

        return parseFloat((percentageUploadedFiles + percentageFile).toFixed(2));
    };

    const getUploadStatus = (
        filesUploaded: string[],
        numberFiles: number,
        callback: (progressKind: string, percentage?: number) => void
    ) => {
        const sucessfullUploadedFiles = filesUploaded.reduce((acc: number, curr: string) => {
            if (curr === 'completed') {
                acc++;
            }
            return acc;
        }, 0);
        sucessfullUploadedFiles === numberFiles
            ? callback(uploadProgressKind.completed)
            : callback(uploadProgressKind.failed);
    };

    const onAcceptProgress = (
        receivedFiles: any,
        numberFiles: number,
        callback: (progressKind: string, percentage?: number) => void
    ) => {
        let completedFiles = 0;
        let uploadedFiles = 0;
        const filesUploaded: string[] = [];
        receivedFiles.map((fileToUpload: any) => {
            list.pcap
                .onlyInsertInDatabase(fileToUpload.name, fileToUpload)
                .then((data: any) => {
                    setReceivedFiles(current => [...current, data]);
                    uploadedFiles++;
                    if (uploadedFiles === numberFiles) {
                        setModalOpen(true);
                    }
                })
                .catch((err: any) => {
                    console.log(err);
                    filesUploaded.push('failed');
                    if (completedFiles === numberFiles) getUploadStatus(filesUploaded, numberFiles, callback);
                });
        });
    };

    const onDrop = React.useCallback((receivedFiles: any) => {
        if (Object.keys(receivedFiles).length === 1) setFilename(receivedFiles[0].path);
        setNumberFiles(Object.keys(receivedFiles).length);
        onAcceptProgress(receivedFiles, Object.keys(receivedFiles).length, uploadProgress);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const resetState = () => {
        setState(states.normal);
        setUploadedFiles(0);
        setNumberFiles(0);
    };

    const normalContents = <DragAndDropTileUpload />;
    const activeContents = <DropHere />;
    const uploading = (
        <CircularProgressBar
            filename={filename}
            percentage={uploadPercentage}
            numberFiles={numberFiles}
            uploadedFiles={uploadedFiles}
        />
    );

    const uploadCompleted = <UploadPcapSucess onResetState={resetState} />;
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

    const onModalClose = () => {
        setUploadedFiles(0);
        setNumberFiles(0);
        setReceivedFiles([]);
        receivedFiles.map(async (fileToUpload: any) => {
            await list.pcap
                .delete(fileToUpload.pcap_id)
                .then(() => {
                    setModalOpen(false);

                })
                .catch((err: any) => {
                    console.log(err);
                });
        });
    }

    const onUploadDone = () => {
        setModalOpen(false);
        setUploadedFiles(0);
        setNumberFiles(0);
        setReceivedFiles([]);
    }

    const showAsButton = isButton && state === states.normal;

    return (
        <div className={showAsButton ? 'upload-pcap-button-container' : 'upload-pcap-tile'}>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                {showAsButton ? (
                    <button className="dashboard-table-view-upload-button">Upload</button>
                ) : (
                    <div className={`drag-and-drop-tile ${contents[1]}`}> {contents[0]}</div>
                )}
            </div>
            {isModalOpen && <UploadModal isOpen={isModalOpen} onUploadDone={onUploadDone} onModalClose={onModalClose} receivedFiles={receivedFiles} />}
        </div>
    );
}

export default UploadPcap;
