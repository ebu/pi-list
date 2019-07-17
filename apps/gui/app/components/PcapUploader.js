import React, { Component } from 'react';
import api from 'utils/api';
import DragAndDropUploader from './upload/DragAndDropUploader';

const PcapUploader = props => (
    <DragAndDropUploader
        uploadButtonLabel="PCAP"
        uploadApi={api.sendPcapFile}
        {...props}
    />
);

PcapUploader.propTypes = {};

PcapUploader.defaultProps = {};

export default PcapUploader;
