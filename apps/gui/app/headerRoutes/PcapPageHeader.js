import React from 'react';
import api from 'utils/api';
import routeBuilder from 'utils/routeBuilder';
import PcapFileNameHeader from '../components/PcapFileNameHeader';
import Header from './Header';
import { DownloadOriginal, DownloadPcap, DownloadSDP, DownloadJson, DownloadPdf } from '../containers/PcapList/utils';

const PcapPageHeader = props => (
    <React.Fragment>
        <Header
            {...props}
            item={<PcapFileNameHeader {...props} />}
            labelTag="navigation.streams"
            buttons={[
                {
                    labelTag: 'pcap.download_networkcapture',
                    icon: 'file download',
                    onClick: () => {
                        DownloadOriginal(props.pcapID);
                    },
                },
                {
                    labelTag: 'pcap.download_pcap',
                    icon: 'file download',
                    onClick: () => {
                        DownloadPcap(props.pcapID);
                    },
                },
                {
                    labelTag: 'pcap.download_sdp',
                    icon: 'file download',
                    onClick: () => {
                        DownloadSDP(props.pcapID);
                    },
                },
                {
                    labelTag: 'pcap.download_json',
                    icon: 'file download',
                    onClick: () => {
                        DownloadJson(props.pcapID);
                    },
                },
                {
                    labelTag: 'pcap.download_pdf',
                    icon: 'file download',
                    onClick: () => {
                        DownloadPdf(props.pcapID);
                    },
                },
                {
                    labelTag: 'buttons.go_back',
                    icon: 'keyboard backspace',
                    onClick: () => {
                        props.history.push(routeBuilder.pcap_list());
                    },
                },
            ]}
        />
    </React.Fragment>
);

export default PcapPageHeader;
