#pragma once

#include "ebu/list/core/types.h"

#include <array>
#include <string>

namespace ebu_list::ethernet
{
    constexpr int num_bytes = 6;
    using mac_address       = std::array<byte, num_bytes>;

    std::string to_string(const mac_address& m);
    std::optional<mac_address> to_mac_address(std::string_view address);

    bool operator>(const mac_address& lhs, const mac_address& rhs);
    bool operator<(const mac_address& lhs, const mac_address& rhs);
    bool operator==(const mac_address& lhs, const mac_address& rhs);
    bool operator!=(const mac_address& lhs, const mac_address& rhs);
    bool operator>=(const mac_address& lhs, const mac_address& rhs);
    bool operator<=(const mac_address& lhs, const mac_address& rhs);
} // namespace ebu_list::ethernet
