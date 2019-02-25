#pragma once

#include "ebu/list/net/ipv4/address.h"
#include <optional>

namespace ebu_list::net
{
    std::optional<ipv4::address> get_ipv4_interface_addr(std::string_view interface_name);
}
