import { NetworkInformation } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import { translate } from '../../../utils/translation';

const getNetworkInformationList = (
    currentStream: SDK.types.IStreamInfo
): Array<{ title: string; value: string; attention?: boolean }> => {
    const invalidMulticastMacAddr = currentStream?.analyses?.destination_multicast_mac_address?.result !== 'compliant';
    const invalidMulticastIpAddr = currentStream?.analyses?.destination_multicast_ip_address?.result !== 'compliant';
    const invalidMulticastMapping = currentStream?.analyses?.unrelated_multicast_addresses?.result !== 'compliant';

    const dropped_count = currentStream.statistics.dropped_packet_count;
    const droppedInfo = dropped_count == 0 ? '' : '${dropped_count}';

    return [
        {
            title: translate('stream.detected_stream'),
            value: 'ST2110',
        },
        {
            title: translate('media_information.rtp.source_mac'),
            value: currentStream?.network_information.source_mac_address.toUpperCase(),
        },
        {
            title: translate('media_information.rtp.destination_mac'),
            value: currentStream?.network_information.destination_mac_address.toUpperCase(),
            attention: invalidMulticastMacAddr || invalidMulticastMapping,
        },
        {
            title: translate('media_information.rtp.source'),
            value: `${currentStream?.network_information.source_address}:${currentStream?.network_information.source_port}`,
        },
        {
            title: translate('media_information.rtp.destination'),
            value: `${currentStream?.network_information.destination_address}:${currentStream?.network_information.destination_port}`,
            attention: invalidMulticastIpAddr,
        },
        {
            title: translate('media_information.rtp.payload_type'),
            value: currentStream?.network_information.payload_type.toString(),
        },
        {
            title: translate('media_information.rtp.ssrc'),
            value: currentStream?.network_information.ssrc.toString(),
        },
        {
            title: translate('media_information.rtp.has_extended_header'),
            value: currentStream?.network_information.has_extended_header
                ? translate('feedback.yes')
                : translate('feedback.no'),
        },
        {
            title: translate('media_information.rtp.packet_count'),
            value:
                currentStream.statistics.dropped_packet_count === 0
                    ? currentStream?.statistics.packet_count.toString()
                    : `${currentStream?.statistics.packet_count.toString()} (${
                          currentStream.statistics.dropped_packet_count
                      } dropped)`,
            attention: dropped_count != 0,
        },
        {
            title: 'DSCP',
            value: currentStream?.network_information.dscp.value.toString(),
        },
        {
            title: "Retransmitted Packets",
            value: currentStream?.statistics.retransmitted_packets
        }
    ];
};

const NetworkInformationPanel = ({ stream }: { stream: SDK.types.IStreamInfo | undefined }) => {
    const headingsNetworkInfo = translate('headings.network_information');
    if (!stream) return null;
    const info = getNetworkInformationList(stream);
    return <NetworkInformation informationStreamsList={info} title={headingsNetworkInfo} />;
};
export default NetworkInformationPanel;
