#pragma once

#include "ebu/list/core/types.h"
#include <array>

namespace ebu_list::udp
{
#pragma pack(push, 1)

    // from https://en.wikipedia.org/wiki/User_Datagram_Protocol

    struct datagram_header
    {
        net_uint16_t srcport;
        net_uint16_t destport;
        net_uint16_t len;
        net_uint16_t chksum;
    };
    static_assert(sizeof(datagram_header) == 8);

#pragma pack(pop)
} // namespace ebu_list::udp
