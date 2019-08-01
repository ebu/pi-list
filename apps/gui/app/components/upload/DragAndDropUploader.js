import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import Button from '../common/Button';
import { withNotifications } from '../../utils/notifications/withNotifications';

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

            const newState = {
                uploadProgress: newStateUploadProgress,
                isUploading: true,
                uploadComplete: false
            };

            this.setState(newState,
                () => this.props.notificationsContext.updateUpload(this.state));

        }).then(() => {
            const newState = { uploadComplete: true, isUploading: false, uploadFailed: false };

            this.setState(newState,
                () => this.props.notificationsContext.updateUpload(this.state));
        }).catch(() => {
            const newState = { uploadComplete: false, isUploading: false, uploadFailed: true };

            this.setState(newState,
                () => this.props.notificationsContext.updateUpload(this.state));
        });
    }

    render() {
        const dropzoneClassName = classNames(this.props.className, 'lst-file-uploader2');

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
                            <PanelTitle rightToolbar={rightToolbar} />
                            <hr />
                            <div onClick={(e) => e.stopPropagation()}>
                                {this.props.children}
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

export default withNotifications(DragAndDropUploader);
