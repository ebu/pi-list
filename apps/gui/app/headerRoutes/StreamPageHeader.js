import React from "react";
import routeBuilder from "utils/routeBuilder";
import PcapFileNameHeader from "../components/PcapFileNameHeader";
import Header from "./Header";

const StreamPageHeader = props => (
  <Header
    {...props}
    item={<PcapFileNameHeader {...props} />}
    labelTag="navigation.stream"
    buttons={[
      {
        labelTag: "stream.configure_streams",
        icon: "settings",
        onClick: () => {
          props.history.push(routeBuilder.stream_config_page(props.pcapID, props.streamID));
        }
      },
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

export default StreamPageHeader;
