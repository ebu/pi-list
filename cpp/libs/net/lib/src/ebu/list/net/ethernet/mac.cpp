#include "ebu/list/net/ethernet/mac.h"
#include "ebu/list/core/idioms.h"
#include "fmt/format.h"
using namespace ebu_list::ethernet;
using namespace ebu_list;

//------------------------------------------------------------------------------

std::string ethernet::to_string(const mac_address& m)
{
    return fmt::format("{:02X}:{:02X}:{:02X}:{:02X}:{:02X}:{:02X}", 
        static_cast<int>(m[0]), static_cast<int>(m[1]), static_cast<int>(m[2]),
        static_cast<int>(m[3]), static_cast<int>(m[4]), static_cast<int>(m[5]));
}
