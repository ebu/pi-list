import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import bytes from 'bytes';
import api from 'utils/api';
import notifications from 'utils/notifications';
import Button from 'components/common/Button';
import ProgressBar from 'components/common/ProgressBar';
import Icon from 'components/common/Icon';
import { translate } from 'utils/translation';

const propTypes = {
    className: PropTypes.string
};

const defaultProps = {
    className: ''
};

class SdpUploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dragActivated: false,
            files: [],
            uploadFailed: false,
            uploadComplete: false
        };

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.uploadSdpFile = this.uploadSdpFile.bind(this);
    }

    onDragEnter() {
        this.setState({ dragActivated: true });
    }

    onDrop(files) {
        this.setState({ files, dragActivated: false });
        files.map((f, index) => this.uploadSdpFile(f, index));
    }

    uploadSdpFile(fileToUpload, index) {
        api.uploadSDP(fileToUpload, (progressEvent) => {
            this.setState({ uploadComplete: false });
        }).then(() => {
            this.setState({ uploadComplete: true, uploadFailed: false });
            notifications.success({
                title: translate('notifications.success.file_upload'),
                message: translate('notifications.success.file_upload_message', { name: fileToUpload.name })
            });
        }).catch(() => {
            this.setState({ uploadComplete: false,  uploadFailed: true });
            notifications.error({
                title: translate('notifications.error.file_upload'),
                message: translate('notifications.error.file_upload_message', { name: fileToUpload.name })
            });
        });
    }

    renderUploadedFiles() {
        return (
            <div className="lst-file-uploader-list fade-in">
                <ul className="lst-file-uploader-files">
                    {this.state.files.map((file, index) => (
                        <li key={file.name} className="row lst-no-padding">
                            <div className="col-xs-1 middle-xs">
                                <Icon
                                    className={classNames('file-icon', {
                                        'lst-text-red': this.state.uploadFailed
                                    })}
                                    value="insert drive file"
                                />
                            </div>
                            <div className="col-xs-11">
                                <div className="file-upload-file-info col-xs-12 row">
                                    <div
                                        className={classNames('col-xs-10 file-file-name', {
                                            'lst-text-red': this.state.uploadFailed
                                        })}
                                    >
                                        <span>{file.name}</span>
                                        <span className="lst-file-uploader-file-size">({bytes(file.size)})</span>
                                    </div>
                                    <div className="col-xs-2 file-upload-progress">
                                        {this.state.uploadComplete && (
                                            <Icon className="lst-text-green fade-in upload-state-icon" value="check" />
                                        )}
                                        {this.state.uploadFailed && (
                                            <Icon className="lst-text-red fade-in upload-state-icon" value="error" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    renderDragAndDropMessage() {
        return (
            <p>
                {translate('workflow.drop_sdp_file_here')} {' '}
                <span className="lst-file-uploader__link">{translate('workflow.select_from_drive')}</span>
            </p>
        );
    }

    renderDropMessage() {
        return (
            <div>
                <i className="lst-file-uploader__icon lst-icons bounce">file_download</i>
                <p>{translate('workflow.drop_sdp_file_here')}</p>
            </div>
        );
    }

    render() {
        const dropzoneClassName = classNames(this.props.className, 'lst-file-uploader');

        return (
            <div className="lst-file-container">
                <Dropzone
                    className={dropzoneClassName}
                    onDragEnter={() => this.setState({ dragActivated: true })}
                    onDrop={this.onDrop}
                    onDragLeave={() => this.setState({ dragActivated: false })}
                    activeClassName="active"
                >
                    {this.state.dragActivated ? this.renderDropMessage() : this.renderDragAndDropMessage()}
                </Dropzone>
                {this.state.files.length > 0 && this.renderUploadedFiles()}
            </div>
        );
    }
}

SdpUploader.propTypes = propTypes;
SdpUploader.defaultProps = defaultProps;

export default SdpUploader;
