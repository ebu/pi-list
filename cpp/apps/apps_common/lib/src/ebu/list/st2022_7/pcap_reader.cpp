#include "ebu/list/core/idioms.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/pcap/reader.h"
#include "ebu/list/st2022_7/db_handler_factory.h"

using namespace ebu_list;

///////////////////////////////////////////////////////////////////////////////
namespace
{
    pcap::file_header load(chunked_data_source& source)
    {
        auto maybe_header = pcap::read_header(source);
        LIST_ENFORCE(maybe_header, std::runtime_error, "Invalid pcap file");

        return maybe_header.value();
    }
} // namespace
///////////////////////////////////////////////////////////////////////////////

pcap_reader::pcap_reader(std::string_view pcap_file)
    : source_(factory, std::make_unique<file_source>(factory, pcap_file)), header_(load(source_))
{
}

std::optional<rtp::packet> pcap_reader::next()
{
    for(;;)
    {
        auto maybe_packet = pcap::read_packet(header_(), source_);
        if(!maybe_packet)
        {
            return std::nullopt;
        }

        auto& packet = maybe_packet.value();
        if(packet.was_padded)
        {
            // TODO: handle truncated files
        }

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

        auto maybe_rtp_packet = rtp::decode(datagram.ethernet_info, datagram.info, std::move(datagram.sdu));
        if(!maybe_rtp_packet) continue;

        return std::move(maybe_rtp_packet.value());
    }
}
