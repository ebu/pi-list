import routeNames from 'config/routeNames';

export default {
    /* Page that enables stream configuration */
    stream_config_page: (pcapID, streamID) => {
        return `${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/${streamID}/${routeNames.CONFIGURE}/`;
    },

    /* Page that shows a Stream from a pcap file */
    stream_page: (pcapID, streamID) =>
        `${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/${streamID}`,

    /* Shows PTP information for a pcap file */
    ptp_info_page: pcapID => `${routeNames.PCAPS}/${pcapID}/ptp/`,

    /* Page that shows all streams inside a pcap file */
    pcap_stream_list: pcapID =>
        `${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}/`,

    /* Page that shows all pcaps files available */
    pcap_list: () => `${routeNames.PCAPS}/`,

    /* Page that shows a live stream */
    live_flow_page: flowID => `${routeNames.LIVE_SENDERS_PAGE}/${flowID}`,

    /* Page that shows a live stream */
    live_stream_page: streamID =>
        `${routeNames.LIVE}/${routeNames.STREAMS_PAGE}/${streamID}`,
};
