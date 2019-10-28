#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/ipv4/address.h"
#include <tuple>

namespace ebu_list::ipv4
{
    enum class protocol_type : uint8_t
    {
        UDP = 17
    };

    struct header
    {
        address destination_address;
        address source_address;
        protocol_type type;
    };

    struct packet_info : header
    {
        clock::time_point packet_time;
    };

    std::tuple<header, oview> decode(oview&& pdu);

    std::ostream& operator<<(std::ostream& os, const header& h);
    std::ostream& operator<<(std::ostream& os, protocol_type h);
} // namespace ebu_list::ipv4
