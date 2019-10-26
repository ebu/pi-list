#include "ebu/list/net/ethernet/mac.h"
#include "ebu/list/core/idioms.h"
#include "fmt/format.h"
using namespace ebu_list::ethernet;
using namespace ebu_list;

//------------------------------------------------------------------------------

std::string ethernet::to_string(const mac_address& m)
{
    return fmt::format("{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}", static_cast<int>(m[0]), static_cast<int>(m[1]),
                       static_cast<int>(m[2]), static_cast<int>(m[3]), static_cast<int>(m[4]), static_cast<int>(m[5]));
}

std::optional<mac_address> ethernet::to_mac_address(std::string_view address)
{
    if (address.size() != 17) return std::nullopt;

    unsigned int values[6] = {0};

    const auto scan_result = sscanf(address.data(), "%x:%x:%x:%x:%x:%x%*c", &values[0], &values[1], &values[2],
                                    &values[3], &values[4], &values[5]);

    if (scan_result != 6) return std::nullopt;

    mac_address mac = {std::byte()};
    for (int i = 0; i < 6; ++i)
    {
        mac[i] = static_cast<std::byte>(values[i]);
    }

    return mac;
}

bool ethernet::operator<(const mac_address& lhs, const mac_address& rhs)
{
    static_assert(num_bytes == 6);
    uint64_t nlhs = 0, nrhs = 0, base = 1;

    for (int i = 0; i < num_bytes; i++)
    {
        nlhs += std::to_integer<uint64_t>(lhs[i]) * base;
        nrhs += std::to_integer<uint64_t>(rhs[i]) * base;
        base *= 10;
    }

    return nlhs < nrhs;
}

bool ethernet::operator>(const mac_address& lhs, const mac_address& rhs)
{
    static_assert(num_bytes == 6);
    uint64_t nlhs = 0, nrhs = 0, base = 1;

    for (int i = 0; i < num_bytes; i++)
    {
        nlhs += std::to_integer<uint64_t>(lhs[i]) * base;
        nrhs += std::to_integer<uint64_t>(rhs[i]) * base;
        base *= 10;
    }

    return nlhs > nrhs;
}

bool ethernet::operator==(const mac_address& lhs, const mac_address& rhs)
{
    static_assert(num_bytes == 6);
    const bool result = lhs[0] == rhs[0] && lhs[1] == rhs[1] && lhs[2] == rhs[2] && lhs[3] == rhs[3] &&
                        lhs[4] == rhs[4] && lhs[5] == rhs[5];
    return result;
}

bool ethernet::operator!=(const mac_address& lhs, const mac_address& rhs)
{
    static_assert(num_bytes == 6);
    const bool r = lhs[0] != rhs[0] && lhs[1] != rhs[1] && lhs[2] != rhs[2] && lhs[3] != rhs[3] && lhs[4] != rhs[4] &&
                   lhs[5] != rhs[5];
    return r;
}

bool ethernet::operator<=(const mac_address& lhs, const mac_address& rhs)
{
    static_assert(num_bytes == 6);
    const bool r = lhs < rhs || lhs == rhs;
    return r;
}

bool ethernet::operator>=(const mac_address& lhs, const mac_address& rhs)
{
    static_assert(num_bytes == 6);
    const bool r = lhs > rhs || lhs == rhs;
    return r;
}
