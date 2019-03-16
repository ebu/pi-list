import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bytes from 'bytes';
import Icon from 'components/common/Icon';
import ProgressBar from 'components/common/ProgressBar';

const UploadProgress = (props) => {
    return (
        <div className="lst-file-uploader-list fade-in">
        <ul className="lst-file-uploader-files">
            {props.files.map((file, index) => (
                <li key={file.name} className="row lst-no-padding">
                    <div className="col-xs-1 middle-xs">
                        <Icon
                            className={classNames('file-icon', {
                                'lst-text-red': props.uploadFailed
                            })}
                            value="insert drive file"
                        />
                    </div>
                    <div className="col-xs-11">
                        <div className="file-upload-file-info col-xs-12 row">
                            <div
                                className={classNames('col-xs-10 file-file-name', {
                                    'lst-text-red': props.uploadFailed && !props.isUploading
                                })}
                            >
                                <span>{file.name}</span>
                                <span className="lst-file-uploader-file-size">({bytes(file.size)})</span>
                            </div>
                            <div className="col-xs-2 file-upload-progress">
                                {props.isUploading && `${props.uploadProgress[index] ? props.uploadProgress[index] : 0}%`}
                                {props.uploadComplete && (
                                    <Icon className="lst-text-green fade-in upload-state-icon" value="check" />
                                )}
                                {props.uploadFailed && !props.isUploading && (
                                    <Icon className="lst-text-red fade-in upload-state-icon" value="error" />
                                )}
                            </div>
                        </div>
                        {(props.isUploading) && (
                            <ProgressBar
                                className="lst-file-uploader-bar fade-in"
                                percentage={props.uploadProgress[index] ? props.uploadProgress[index] : 0}
                            />
                        )}
                    </div>

                </li>
            ))}
        </ul>
    </div>
);
};

UploadProgress.propTypes = {
    files: PropTypes.arrayOf(PropTypes.object),
    isUploading: PropTypes.bool,
    uploadComplete: PropTypes.bool,
    uploadFailed: PropTypes.bool,
    uploadProgress: PropTypes.arrayOf(PropTypes.number),
};

UploadProgress.defaultProps = {
    files: [],
    isUploading: false,
    uploadComplete: false,
    uploadFailed: false,
    uploadProgress: [],
};

export default UploadProgress;
