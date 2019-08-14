#pragma once

#include "ebu/list/net/ethernet/mac.h"
#include "ebu/list/net/ipv4/address.h"

namespace ebu_list
{
    bool is_multicast_address (const ethernet::mac_address &addr);
    bool is_multicast_address (const ipv4::address &addr);
    bool is_same_multicast_address (const ethernet::mac_address &mac_addr, const ipv4::address &ip_addr);
}

