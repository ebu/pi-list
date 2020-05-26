import React, { useCallback, useReducer, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDropzone } from 'react-dropzone';
import Button from '../common/Button';
import { withNotifications } from '../../utils/notifications/withNotifications';

const PanelTitle = props => (
    <div className="row lst-panel__header lst-truncate">
        <div className="col-xs-6">
            <h2 className="fit-to-div">
                {props.icon && <Icon value={props.icon} />}
                {props.title}
            </h2>
        </div>
        <div className="col-xs-6 end-xs">{props.rightToolbar}</div>
    </div>
);

const actions = {
    addFile: 'addFile', // payload: { index: number, file: <file as received from DnD>}
    updatePercentage: 'updatePercentage', // payload: { index: <file index>, percentage: < number >}
    uploadCompleted: 'uploadCompleted', // payload: { index: <file index>}
    uploadFailed: 'uploadFailed', // payload: { index: <file index>}
};

const initialState = {
    files: [],
};

const reducer = (state, action) => {
    switch (action.type) {
        case actions.addFile: {
            const { index, file } = action.payload;
            const newState = _.cloneDeep(state);
            newState.files[index] = { file: file };

            return newState;
        }

        case actions.updatePercentage: {
            const { index, percentage } = action.payload;
            const newState = _.cloneDeep(state);
            newState.files[index] = {
                ...newState.files[index],
                uploadProgress: percentage,
                isUploading: true,
                uploadComplete: false,
            };

            return newState;
        }

        case actions.uploadCompleted: {
            const { index } = action.payload;
            const newState = _.cloneDeep(state);
            newState.files[index] = {
                ...newState.files[index],
                uploadComplete: true,
                isUploading: false,
                uploadFailed: false,
            };

            return newState;
        }

        case actions.uploadFailed: {
            const { index } = action.payload;
            const newState = _.cloneDeep(state);
            newState.files[index] = {
                ...newState.files[index],
                uploadComplete: false,
                isUploading: false,
                uploadFailed: true,
            };

            return newState;
        }

        default:
            return state;
    }
};

const DragAndDropUploader = props => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const onDrop = useCallback(receivedFiles => {
        receivedFiles.map((fileToUpload, index) => {
            dispatch({ type: actions.addFile, payload: { index: index, file: fileToUpload } });

            props
                .uploadApi(fileToUpload, uploadPercentage => {
                    dispatch({
                        type: actions.updatePercentage,
                        payload: { index: index, percentage: uploadPercentage },
                    });
                })
                .then(() => {
                    dispatch({ type: actions.uploadCompleted, payload: { index: index } });
                })
                .catch(() => {
                    dispatch({ type: actions.uploadFailed, payload: { index: index } });
                });
        });
    });

    useEffect(() => {
        if (state.files.length > 0) {
            props.notificationsContext.updateUpload({ files: state.files });
        }
    }, [state.files]);

    const dropzoneClassName = classNames(props.className, 'lst-file-uploader2');

    const cardClassNames = classNames('lst-panel', props.className);

    const containerClassNames = classNames('lst-panel__container', props.containerClassName, {
        'lst-panel--no-padding': props.noPadding,
        'lst-panel--padding': !props.noPadding,
        'lst-panel--no-border': props.noBorder,
        'lst-panel--border': !props.noBorder,
        'lst-panel--full-height': props.fullHeight,
    });

    const rightToolbar = (
        <div className="row end-xs lst-text-right lst-no-margin">
            <Button icon="file upload" label={props.uploadButtonLabel} />
        </div>
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="lst-file-container">
            <div className={cardClassNames}>
                <div {...getRootProps()}>
                    <PanelTitle rightToolbar={rightToolbar} {...props} />
                    <div className={`${containerClassNames} ${dropzoneClassName}`}>
                        <input {...getInputProps()} />
                        <hr />
                        <div onClick={e => e.stopPropagation()}>{props.children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

DragAndDropUploader.propTypes = {
    className: PropTypes.string,
    uploadButtonLabel: PropTypes.string,
    uploadApi: PropTypes.func,
    title: PropTypes.string,
};

DragAndDropUploader.defaultProps = {
    className: '',
    uploadButtonLabel: '',
    uploadApi: () => {},
    title: null,
};

export default withNotifications(DragAndDropUploader);
