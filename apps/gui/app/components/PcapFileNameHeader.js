import React, { Component } from 'react';
import api from '../utils/api';
import asyncLoader from './asyncLoader';

const PcapFileNameHeader = props => (
    <div className="lst-header-item fade-in">{props.pcap.file_name}</div>
);

export default asyncLoader(PcapFileNameHeader, {
    loaderProps: {
        loadingWidget: <div className="lst-header-item fade-in"></div>,
    },
    asyncRequests: {
        pcap: props => {
            const { pcapID } = props.match.params;
            return api.getPcap(pcapID);
        },
    },
});
