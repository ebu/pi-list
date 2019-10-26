#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/types.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "ebu/list/net/ipv4/decoder.h"
#include <tuple>

namespace ebu_list::udp
{
    struct header
    {
        port source_port;
        port destination_port;
    };

    struct datagram_info : header, ipv4::packet_info
    {
        size_t datagram_size;
    };

    struct datagram
    {
        ethernet::header ethernet_info;
        datagram_info info;
        oview sdu;
    };

    std::tuple<header, oview> decode(oview&& pdu);

    udp::datagram make_datagram(clock::time_point packet_time, ethernet::mac_address source_mac_address,
                                ethernet::mac_address destination_mac_address, ethernet::payload_type payload_type,
                                ipv4::address source_address, port source_port, ipv4::address destination_address,
                                port destination_port, oview&& payload);

    std::ostream& operator<<(std::ostream& os, const header& h);

    ipv4::endpoint source(const datagram_info& info);
    ipv4::endpoint destination(const datagram_info& info);
} // namespace ebu_list::udp
