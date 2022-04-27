#include "ebu/list/net/mac_address_analyzer.h"

using namespace ebu_list;
using nlohmann::json;

mac_address_analyzer::mac_address_analyzer()
{
}

mac_address_analyzer::~mac_address_analyzer() = default;

void mac_address_analyzer::on_data(const rtp::packet& p)
{
    std::string current_mac_address = ethernet::to_string(p.info.ethernet_info.destination_address);
    if(info.repeated_mac_addresses.size() == 0)
    {
        info.repeated_mac_addresses.push_back({current_mac_address, 1});
    }
    else
    {
        const auto mac_address_resolved = std::find_if(
            info.repeated_mac_addresses.begin(), info.repeated_mac_addresses.end(),
            [current_mac_address](mac_addresses_structure& n) { return n.mac_address == current_mac_address; });
        if(mac_address_resolved == info.repeated_mac_addresses.end())
        {
            info.repeated_mac_addresses.push_back({current_mac_address, 1});
        }
        else
        {
            mac_address_resolved->count++;
        }
    }
}

mac_address_analyzer::mac_addresses_info mac_address_analyzer::get_mac_addresses_analysis() const
{
    return info;
}

void mac_address_analyzer::on_complete()
{
}

void mac_address_analyzer::on_error()
{
}
