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

class PcapUploader extends Component {
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
        this.uploadPcapFile = this.uploadPcapFile.bind(this);
    }

    onDragEnter() {
        this.setState({ dragActivated: true });
    }

    onDrop(files) {
        this.setState({ files, dragActivated: false });
        files.map((f, index) => this.uploadPcapFile(f, index));
    }

    uploadPcapFile(fileToUpload, index) {
        api.sendPcapFile(fileToUpload, (uploadPercentage) => {
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
                title: translate('notifications.success.pcap_upload'),
                message: translate('notifications.success.pcap_upload_message', { name: fileToUpload.name })
            });
        }).catch(() => {
            this.setState({ uploadComplete: false, isUploading: false, uploadFailed: true });
            notifications.error({
                title: translate('notifications.error.pcap_upload'),
                message: translate('notifications.error.pcap_upload_message', { name: fileToUpload.name })
            });
        });
    }

    renderUploadedFiles() {
        return (
            <div className="lst-pcap-uploader-list fade-in">
                <h3>{translate('workflow.pcaps_to_be_imported')}</h3>
                <ul className="lst-pcap-uploader-files">
                    {this.state.files.map((file, index) => (
                        <li key={file.name} className="row lst-no-padding">
                            <div className="col-xs-1 middle-xs">
                                <Icon
                                    className={classNames('pcap-icon', {
                                        'lst-text-red': this.state.uploadFailed
                                    })}
                                    value="insert drive file"
                                />
                            </div>
                            <div className="col-xs-11">
                                <div className="pcap-upload-file-info col-xs-12 row">
                                    <div
                                        className={classNames('col-xs-10 pcap-file-name', {
                                            'lst-text-red': this.state.uploadFailed && !this.state.isUploading
                                        })}
                                    >
                                        <span>{file.name}</span>
                                        <span className="lst-pcap-uploader-file-size">({bytes(file.size)})</span>
                                    </div>
                                    <div className="col-xs-2 pcap-upload-progress">
                                        {this.state.isUploading && `${this.state.uploadProgress[index] ? this.state.uploadProgress[index] : 0}%`}
                                        {this.state.uploadComplete && (
                                            <Icon className="lst-text-green fade-in upload-state-icon" value="check" />
                                        )}
                                        {this.state.uploadFailed && !this.state.isUploading && (
                                            <Icon className="lst-text-red fade-in upload-state-icon" value="error" />
                                        )}
                                    </div>
                                </div>
                                {(this.state.isUploading) && (
                                    <ProgressBar
                                        className="lst-pcap-uploader-bar fade-in"
                                        percentage={this.state.uploadProgress[index] ? this.state.uploadProgress[index] : 0}
                                    />
                                )}
                            </div>

                        </li>
                    ))}
                </ul>
                <div className="row reverse">
                    <Button
                        type="info"
                        label={translate('workflow.import_pcap')}
                        onClick={() => this.state.files.map((f, index) => this.uploadPcapFile(f, index))}
                        disabled={this.state.isUploading}
                        outline
                        noMargin
                    />
                </div>
            </div>
        );
    }

    renderDragAndDropMessage() {
        return (
            <p>
                {translate('workflow.drop_files_here')} {' '}
                <span className="lst-pcap-uploader__link">{translate('workflow.select_from_drive')}</span>
            </p>
        );
    }

    renderDropMessage() {
        return (
            <div>
                <i className="lst-pcap-uploader__icon lst-icons bounce">file_download</i>
                <p>{translate('workflow.drop_files_here')}</p>
            </div>
        );
    }

    render() {
        const dropzoneClassName = classNames(this.props.className, 'lst-pcap-uploader');

        return (
            <div className="lst-pcap-container">
                <Dropzone
                    className={dropzoneClassName}
                    onDragEnter={() => this.setState({ dragActivated: true })}
                    onDrop={this.onDrop}
                    onDragLeave={() => this.setState({ dragActivated: false })}
                    activeClassName="active"
                    disabled={this.state.isUploading}
                >
                    {this.state.dragActivated ? this.renderDropMessage() : this.renderDragAndDropMessage()}
                </Dropzone>
                {this.state.files.length > 0 && this.renderUploadedFiles()}
            </div>
        );
    }
}

PcapUploader.propTypes = propTypes;
PcapUploader.defaultProps = defaultProps;

export default PcapUploader;
