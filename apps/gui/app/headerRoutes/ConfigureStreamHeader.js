import React from "react";
import routeBuilder from "utils/routeBuilder";
import PcapFileNameHeader from "../components/PcapFileNameHeader";
import Header from "./Header";

const ConfigureStreamHeader = props => (
  <Header
    {...props}
    item={<PcapFileNameHeader {...props} />}
    labelTag="stream.configure_streams"
    buttons={[
      {
        labelTag: "buttons.go_back",
        icon: "keyboard backspace",
        onClick: () => {
          props.history.push(routeBuilder.pcap_stream_list(props.pcapID));
        }
      }
    ]}
  />
);

export default ConfigureStreamHeader;
