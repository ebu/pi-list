#include "rtp_source.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "pch.h"

using namespace ebu_list;
using namespace ebu_list::test;

//------------------------------------------------------------------------------

rtp_source::rtp_source(path pcap_file)
    : bf_(std::make_shared<malloc_sbuffer_factory>()), source_(bf_, std::make_unique<file_source>(bf_, pcap_file)),
      file_header_(pcap::read_header(source_))
{
    LIST_ENFORCE(file_header_.has_value(), std::runtime_error, "Error opening file '{}'", pcap_file);
}

rtp::maybe_packet rtp_source::next()
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

        auto datagram =
            udp::make_datagram(packet_timestamp, ethernet_header.source_address, ethernet_header.destination_address,
                               ethernet_header.type, ipv4_header.source_address, udp_header.source_port,
                               ipv4_header.destination_address, udp_header.destination_port, std::move(udp_payload));

        auto maybe_rtp_packet = rtp::decode(datagram.ethernet_info, datagram.info, std::move(datagram.sdu));

        if(!maybe_rtp_packet) return std::nullopt;

        return std::move(maybe_rtp_packet.value());
    }
}
