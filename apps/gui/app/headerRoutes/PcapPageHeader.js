import React from "react";
import api from "utils/api";
import routeBuilder from "utils/routeBuilder";
import PcapFileNameHeader from "../components/PcapFileNameHeader";
import Header from './Header';

const PcapPageHeader = props => (
  <React.Fragment>
    <Header
      {...props}
      item={<PcapFileNameHeader {...props} />}
      labelTag="navigation.streams"
      buttons={[
        {
          labelTag: "pcap.download_networkcapture",
          icon: "file download",
          downloadPath: api.downloadOriginalCaptureUrl(
            props.pcapID
          ),
          onClick: () => {}
        },
        {
          labelTag: "pcap.download_pcap",
          icon: "file download",
          downloadPath: api.downloadPcapUrl(props.pcapID),
          onClick: () => {}
        },
        {
          labelTag: "pcap.download_sdp",
          icon: "file download",
          downloadPath: api.downloadSDPUrl(props.pcapID),
          onClick: () => {}
        },
        {
          labelTag: "pcap.download_json",
          icon: "file download",
          downloadPath: api.downloadJsonUrl(props.pcapID),
          onClick: () => {}
        },
        {
          labelTag: "pcap.download_pdf",
          icon: "file download",
          downloadPath: api.downloadPdfUrl(props.pcapID),
          onClick: () => {}
        },
        {
          labelTag: "buttons.go_back",
          icon: "keyboard backspace",
          onClick: () => {
            props.history.push(routeBuilder.pcap_list());
          }
        }
      ]}
    />
  </React.Fragment>
);

export default PcapPageHeader;
