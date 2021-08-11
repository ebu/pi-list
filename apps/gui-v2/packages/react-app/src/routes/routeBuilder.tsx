import routeNames from './routeNames';

export default {
  pcap_stream_list: (pcapID: string): string => `${routeNames.PCAPS}/${pcapID}/${routeNames.STREAMS_PAGE}`,
};
