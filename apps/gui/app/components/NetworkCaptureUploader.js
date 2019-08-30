import React, { Component } from 'react';
import api from 'utils/api';
import { translateX } from '../utils/translation';
import DragAndDropUploader from './upload/DragAndDropUploader';

const NetworkCaptureUploader = props => (
    <DragAndDropUploader
        uploadButtonLabel={translateX('workflow.import_networkcapture_btn')}
        uploadApi={api.sendPcapFile}
        {...props}
    />
);

NetworkCaptureUploader.propTypes = {};

NetworkCaptureUploader.defaultProps = {};

export default NetworkCaptureUploader;
