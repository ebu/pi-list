#include "ebu/list/net/ethernet/mac.h"
#include "ebu/list/core/idioms.h"
#include "fmt/format.h"
using namespace ebu_list::ethernet;
using namespace ebu_list;

//------------------------------------------------------------------------------

std::string ethernet::to_string(const mac_address& m)
{
    return fmt::format("{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}", 
        static_cast<int>(m[0]), static_cast<int>(m[1]), static_cast<int>(m[2]),
        static_cast<int>(m[3]), static_cast<int>(m[4]), static_cast<int>(m[5]));
}

std::optional<mac_address> ethernet::to_mac_address(std::string_view address)
{
    if(address.size() != 17) return std::nullopt;

    unsigned int values[6] = {0};

    const auto scan_result = sscanf(address.data(), 
        "%x:%x:%x:%x:%x:%x%*c",
        &values[0], &values[1], &values[2],
        &values[3], &values[4], &values[5]);

    if(scan_result != 6) return std::nullopt;

    mac_address mac = { std::byte() };
    for(int i = 0; i < 6; ++i)
    {
        mac[i] = static_cast<std::byte>(values[i]);
    }

    return mac;
}
