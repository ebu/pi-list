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
            {props.files.map((item) => (
                <li key={item.file.name} className="row lst-no-padding">
                    <div className="col-xs-1 middle-xs">
                        <Icon
                            className={classNames('file-icon', {
                                'lst-text-red': item.uploadFailed
                            })}
                            value="insert drive file"
                        />
                    </div>
                    <div className="col-xs-11">
                        <div className="file-upload-file-info col-xs-12 row">
                            <div
                                className={classNames('col-xs-10 file-file-name', {
                                    'lst-text-red': item.uploadFailed && !item.isUploading
                                })}
                            >
                                <span>{item.file.name}</span>
                                <span className="lst-file-uploader-file-size">({bytes(item.file.size)})</span>
                            </div>
                            <div className="col-xs-2 file-upload-progress">
                                {item.isUploading && `${item.uploadProgress ? item.uploadProgress : 0}%`}
                                {item.uploadComplete && (
                                    <Icon className="lst-text-green fade-in upload-state-icon" value="check" />
                                )}
                                {item.uploadFailed && !item.isUploading && (
                                    <Icon className="lst-text-red fade-in upload-state-icon" value="error" />
                                )}
                            </div>
                        </div>
                        {(item.isUploading) && (
                            <ProgressBar
                                className="lst-file-uploader-bar fade-in"
                                percentage={item.uploadProgress ? item.uploadProgress : 0}
                            />
                        )}
                    </div>

                </li>
            ))}
        </ul>
    </div>
);
};

const FileShape = PropTypes.shape({
    name: PropTypes.string,
    size: PropTypes.number,
});

UploadProgress.propTypes = {
    files: PropTypes.arrayOf(FileShape).isRequired,
    isUploading: PropTypes.bool.isRequired,
    uploadComplete: PropTypes.bool.isRequired,
    uploadFailed: PropTypes.bool.isRequired,
    uploadProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
};

UploadProgress.defaultProps = {
    files: [],
    isUploading: false,
    uploadComplete: false,
    uploadFailed: false,
    uploadProgress: [],
};

export default UploadProgress;
