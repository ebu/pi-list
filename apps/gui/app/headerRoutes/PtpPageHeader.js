import React from "react";
import routeBuilder from "utils/routeBuilder";
import PcapFileNameHeader from "../components/PcapFileNameHeader";
import Header from "./Header";

const PtpPageHeader = props => (<Header
  {...props}
  item={<PcapFileNameHeader {...props} />}
  labelTag="navigation.ptp_analysis"
  buttons={[
    {
      labelTag: "buttons.go_back",
      icon: "keyboard backspace",
      onClick: () => {
        props.history.push(routeBuilder.pcap_stream_list(props.pcapID));
      }
    }
  ]}
/>);

export default PtpPageHeader;
