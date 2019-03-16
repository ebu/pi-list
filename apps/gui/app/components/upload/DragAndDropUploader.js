import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import notifications from '../../utils/notifications';
import UploadProgress from './UploadProgress';
import { translate } from '../../utils/translation';
import Button from '../common/Button';


const PanelTitle = (props) => (
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


class DragAndDropUploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dragActivated: false,
            files: [],
            uploadProgress: [],
            isUploading: false,
            uploadFailed: false,
            uploadComplete: false
        };

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
    }

    onDragEnter() {
        this.setState({ dragActivated: true });
    }

    onDrop(files) {
        this.setState({ files, dragActivated: false });
        files.map((f, index) => this.uploadFile(f, index));
    }

    uploadFile(fileToUpload, index) {
        this.props.uploadApi(fileToUpload, (uploadPercentage) => {
            const newStateUploadProgress = this.state.uploadProgress;
            newStateUploadProgress[index] = uploadPercentage;
            this.setState({
                uploadProgress: newStateUploadProgress,
                isUploading: true,
                uploadComplete: false
            });
        }).then(() => {
            this.setState({ uploadComplete: true, isUploading: false, uploadFailed: false });
            notifications.success({
                title: translate('notifications.success.file_upload'),
                message: translate('notifications.success.file_upload_message', { name: fileToUpload.name })
            });
        }).catch(() => {
            this.setState({ uploadComplete: false, isUploading: false, uploadFailed: true });
            notifications.error({
                title: translate('notifications.error.file_upload'),
                message: translate('notifications.error.file_upload_message', { name: fileToUpload.name })
            });
        });
    }

    render() {
        const dropzoneClassName = classNames(this.props.className, 'lst-file-uploader2');
        const uploadProgress = (
            <UploadProgress
                files={this.state.files}
                isUploading={this.state.isUploading}
                uploadComplete={this.state.uploadComplete}
                uploadFailed={this.state.uploadFailed}
                uploadProgress={this.state.uploadProgress}
            />
        );

        const cardClassNames = classNames(
            'lst-panel',
            this.props.className
        );

        const containerClassNames = classNames(
            'lst-panel__container',
            this.props.containerClassName,
            {
                'lst-panel--no-padding': this.props.noPadding,
                'lst-panel--padding': !this.props.noPadding,
                'lst-panel--no-border': this.props.noBorder,
                'lst-panel--border': !this.props.noBorder,
                'lst-panel--full-height': this.props.fullHeight
            }
        );

        const rightToolbar = (
            <div className="row end-xs lst-text-right lst-no-margin">
                <Button icon="file upload" label={this.props.uploadButtonLabel} />
            </div>
        );

        return (
            <Dropzone
                className={dropzoneClassName}
                onDragEnter={() => this.setState({ dragActivated: true })}
                onDrop={this.onDrop}
                onDragLeave={() => this.setState({ dragActivated: false })}
                activeClassName="active"
            >
                <div className="lst-file-container">
                    <div className={cardClassNames}>
                        <div className={containerClassNames}>
                            <PanelTitle {...this.props} rightToolbar={rightToolbar} />
                            <hr />
                            <div onClick={(e) => e.stopPropagation()}>
                                {this.props.children}
                                {this.state.files.length > 0 && uploadProgress}
                            </div>
                        </div>
                    </div>
                </div>
            </Dropzone>
        );
    }
}

DragAndDropUploader.propTypes = {
    className: PropTypes.string,
    uploadButtonLabel: PropTypes.string,
    uploadApi: PropTypes.func
};

DragAndDropUploader.defaultProps = {
    className: '',
    uploadButtonLabel: '',
    uploadApi: () => { }
};

export default DragAndDropUploader;
