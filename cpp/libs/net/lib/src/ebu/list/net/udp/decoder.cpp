#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/datagram.h"
#include <iomanip>
#include <sstream>

using namespace ebu_list;

//------------------------------------------------------------------------------

std::tuple<udp::header, oview> udp::decode(oview&& pdu)
{
    using udp_header_slice         = mapped_oview<datagram_header>;
    auto [udp_header, udp_payload] = split(std::move(pdu), sizeof(datagram_header));
    udp_header_slice s(std::move(udp_header));
    header h;
    h.destination_port = s.value().destport;
    h.source_port      = s.value().srcport;

    return {h, udp_payload};
}

udp::datagram udp::make_datagram(ethernet::mac_address source_mac_address,
                                 ethernet::mac_address destination_mac_address, ethernet::payload_type payload_type,
                                 ipv4::packet_info ip_info, port source_port, port destination_port, oview&& payload)
{
    auto d                              = udp::datagram{};
    d.ethernet_info.source_address      = source_mac_address;
    d.ethernet_info.destination_address = destination_mac_address;
    d.ethernet_info.type                = payload_type;
    d.info.packet_time                  = ip_info.packet_time;
    d.info.source_address               = ip_info.source_address;
    d.info.destination_address          = ip_info.destination_address;
    d.info.dscp                         = ip_info.dscp;
    d.info.type                         = ip_info.type;
    d.info.source_port                  = source_port;
    d.info.destination_port             = destination_port;
    d.info.datagram_size                = sizeof(datagram_header) + payload.view().size_bytes();
    d.sdu                               = std::move(payload);
    return d;
}

std::ostream& udp::operator<<(std::ostream& os, const header& h)
{
    os << "UDP - destination port: " << std::to_string(to_native(h.destination_port))
       << ", source port: " << std::to_string(to_native(h.source_port));

    return os;
}

ipv4::endpoint udp::source(const datagram_info& info)
{
    return {info.source_address, info.source_port};
}

ipv4::endpoint udp::destination(const datagram_info& info)
{
    return {info.destination_address, info.destination_port};
}
