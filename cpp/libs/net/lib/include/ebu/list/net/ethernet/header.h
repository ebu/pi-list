#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/net/ethernet/mac.h"
#include <array>

namespace ebu_list::ethernet
{
#pragma pack(push, 1)

    // from https://en.wikipedia.org/wiki/Ethernet_frame

    struct l2_header
    {
        mac_address destination_address;
        mac_address source_address;
        net_uint16_t type;
    };

    static_assert(sizeof(l2_header) == 14);

#pragma pack(pop)
}
