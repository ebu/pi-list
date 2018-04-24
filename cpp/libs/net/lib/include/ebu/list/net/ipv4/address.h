#pragma once

#include "ebu/list/core/types.h"
#include <array>
#include <string>

namespace ebu_list::ipv4
{
    // IPv4 address in network byte order
    // (like in_addr::S_addr)
    enum class address : uint32_t;

    struct endpoint
    {
        address addr;
        port p;
    };
    endpoint from_string(std::string_view address, uint16_t port);
    endpoint from_string(std::string_view address, std::string_view port);

    bool operator<(const endpoint& lhs, const endpoint& rhs);
    bool operator==(const endpoint& lhs, const endpoint& rhs);
    bool operator!=(const endpoint& lhs, const endpoint& rhs);

    address from_dotted_string(std::string_view s);
 
    std::string to_string(const address& a);
    std::ostream& operator<<(std::ostream& os, address a);

    std::string to_string(const endpoint& e);
    std::ostream& operator<<(std::ostream& os, endpoint e);
}
