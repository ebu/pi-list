#pragma once

#include "ebu/list/net/ethernet/mac.h"
#include "ebu/list/core/memory/bimo.h"
#include <tuple>

namespace ebu_list::ethernet
{
    enum class payload_type : uint16_t
    {
        IPv4 = 0x0800,
        VLAN_802_1Q = 0x8100
    };

    struct header
    {
        mac_address destination_address;
        mac_address source_address;
        payload_type type;
    };

    std::tuple<header, oview> decode(oview&& s);

    std::ostream& operator<<(std::ostream& os, const header& h);
    std::ostream& operator<<(std::ostream& os, payload_type h);
}
