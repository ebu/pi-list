#include "udp_source.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/net/ethernet/decoder.h"

using namespace ebu_list;
using namespace ebu_list::test;

//------------------------------------------------------------------------------

udp_source::udp_source(path pcap_file)
    : bf_(std::make_shared<malloc_sbuffer_factory>()), source_(bf_, std::make_unique<file_source>(bf_, pcap_file)),
      file_header_(pcap::read_header(source_))
{
    LIST_ENFORCE(file_header_.has_value(), std::runtime_error, "Error opening file '{}'", pcap_file);
}

udp::maybe_datagram udp_source::next()
{
    for(;;)
    {
        auto maybe_packet = pcap::read_packet(file_header_.value()(), source_);
        if(!maybe_packet) return std::nullopt;

        auto& packet                = maybe_packet.value();
        const auto packet_timestamp = packet.pcap_header.view().timestamp();

        auto [ethernet_header, ethernet_payload] = ethernet::decode(std::move(packet.data));
        if(ethernet_header.type != ethernet::payload_type::IPv4) continue;

        auto [ipv4_header, ipv4_payload] = ipv4::decode(std::move(ethernet_payload));
        if(ipv4_header.type != ipv4::protocol_type::UDP) continue;

        auto [udp_header, udp_payload] = udp::decode(std::move(ipv4_payload));

        ipv4::packet_info ipv4_info{ipv4_header, packet_timestamp};
        auto datagram = udp::make_datagram(ethernet_header.source_address, ethernet_header.destination_address,
                                           ethernet_header.type, ipv4_info, udp_header.source_port,
                                           udp_header.destination_port, std::move(udp_payload));

        return datagram;
    }
}
