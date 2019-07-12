#pragma once

#include "ebu/list/core/types.h"

#include <array>
#include <string>

namespace ebu_list::ethernet
{
    using mac_address = std::array<byte, 6>;

    std::string to_string(const mac_address& m);
    std::optional<mac_address> to_mac_address(std::string_view address);
}
