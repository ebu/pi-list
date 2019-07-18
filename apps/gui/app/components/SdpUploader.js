import React, { Component } from 'react';
import api from 'utils/api';
import DragAndDropUploader from './upload/DragAndDropUploader';

const SdpUploader = props => (
    <DragAndDropUploader
        uploadButtonLabel="SDP"
        uploadApi={api.uploadSDP}
        {...props}
    />
);

SdpUploader.propTypes = {};

SdpUploader.defaultProps = {};

export default SdpUploader;
